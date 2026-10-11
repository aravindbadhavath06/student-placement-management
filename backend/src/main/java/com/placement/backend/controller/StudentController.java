
package com.placement.backend.controller;

import com.placement.backend.dto.StudentDTO;
import com.placement.backend.entity.Skill;
import com.placement.backend.entity.Student;
import com.placement.backend.entity.User;
import com.placement.backend.repository.UserRepository;
import com.placement.backend.service.StudentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final UserRepository userRepository;

    public StudentController(
            StudentService studentService,
            UserRepository userRepository) {
        this.studentService = studentService;
        this.userRepository = userRepository;
    }

    // Create a student (ADMIN/OFFICER access enforced by SecurityConfig)
    @PostMapping
    public ResponseEntity<?> createStudent(
            @RequestBody StudentDTO studentDTO) {

        Student student = studentService.saveStudent(studentDTO);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToDTO(student));
    }

    // Only ADMIN/OFFICER can view all students
    @GetMapping
    public ResponseEntity<?> getAllStudents(
            Authentication authentication) {

        if (!isAdminOrOfficer(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only ADMIN or OFFICER can view all students");
        }

        List<StudentDTO> students =
                studentService.getAllStudents()
                        .stream()
                        .map(this::convertToDTO)
                        .toList();

        return ResponseEntity.ok(students);
    }

    // ADMIN/OFFICER can view any student; STUDENT only their own
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(
            @PathVariable Long id,
            Authentication authentication) {

        Optional<Student> student =
                studentService.getStudentById(id);

        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!canAccessStudent(student.get(), authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can access only your own student profile");
        }

        return ResponseEntity.ok(convertToDTO(student.get()));
    }

    // ADMIN/OFFICER can search any roll number; STUDENT only their own
    @GetMapping("/roll/{rollNumber}")
    public ResponseEntity<?> getStudentByRollNumber(
            @PathVariable String rollNumber,
            Authentication authentication) {

        Optional<Student> student =
                studentService.getStudentByRollNumber(rollNumber);

        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!canAccessStudent(student.get(), authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can access only your own student profile");
        }

        return ResponseEntity.ok(convertToDTO(student.get()));
    }

    // Users can view their own profile; ADMIN/OFFICER can view any
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getStudentByUserId(
            @PathVariable Long userId,
            Authentication authentication) {

        User currentUser = userRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authenticated user not found");
        }

        if (!isAdminOrOfficer(authentication)
                && !currentUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can access only your own student profile");
        }

        Optional<Student> student =
                studentService.getStudentByUserId(userId);

        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToDTO(student.get()));
    }

    // Only ADMIN can delete students (enforced by SecurityConfig)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(
            @PathVariable Long id) {

        if (studentService.getStudentById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        studentService.deleteStudent(id);

        return ResponseEntity.noContent().build();
    }

    private boolean isAdminOrOfficer(
            Authentication authentication) {

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role ->
                        role.equals("ROLE_ADMIN")
                        || role.equals("ROLE_OFFICER"));
    }

    private boolean canAccessStudent(
            Student student,
            Authentication authentication) {

        if (isAdminOrOfficer(authentication)) {
            return true;
        }

        User currentUser = userRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        return currentUser != null
                && student.getUser() != null
                && currentUser.getId().equals(
                        student.getUser().getId());
    }

    // Convert Student entity into a DTO to avoid exposing linked User data
    private StudentDTO convertToDTO(Student student) {

        StudentDTO dto = new StudentDTO();

        dto.setId(student.getId());
        dto.setRollNumber(student.getRollNumber());
        dto.setPhone(student.getPhone());
        dto.setYear(student.getYear());
        dto.setCgpa(student.getCgpa());

        if (student.getUser() != null) {
            dto.setUserId(student.getUser().getId());
        }

        if (student.getDepartment() != null) {
            dto.setDepartmentId(student.getDepartment().getId());
        }

        Set<Long> skillIds = student.getSkills()
                .stream()
                .map(Skill::getId)
                .collect(Collectors.toSet());

        dto.setSkillIds(skillIds);

        return dto;
    }
}
