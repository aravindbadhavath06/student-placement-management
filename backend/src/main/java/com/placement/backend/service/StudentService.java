
package com.placement.backend.service;

import com.placement.backend.dto.StudentDTO;
import com.placement.backend.entity.Department;
import com.placement.backend.entity.Skill;
import com.placement.backend.entity.Student;
import com.placement.backend.entity.User;
import com.placement.backend.repository.DepartmentRepository;
import com.placement.backend.repository.SkillRepository;
import com.placement.backend.repository.StudentRepository;
import com.placement.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SkillRepository skillRepository;

    public StudentService(
            StudentRepository studentRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            SkillRepository skillRepository
    ) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.skillRepository = skillRepository;
    }

    public Student saveStudent(StudentDTO dto) {

        if (studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new RuntimeException("Roll number already exists");
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Department department = departmentRepository
                .findById(dto.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException("Department not found")
                );

        Set<Skill> skills = new HashSet<>();

        if (dto.getSkillIds() != null) {
            for (Long skillId : dto.getSkillIds()) {
                Skill skill = skillRepository.findById(skillId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Skill not found: " + skillId
                                )
                        );

                skills.add(skill);
            }
        }

        Student student = new Student();

        student.setRollNumber(dto.getRollNumber());
        student.setPhone(dto.getPhone());
        student.setYear(dto.getYear());
        student.setCgpa(dto.getCgpa());
        student.setUser(user);
        student.setDepartment(department);
        student.setSkills(skills);

        return studentRepository.save(student);
    }

    /**
     * Updates only the authenticated student's editable profile fields.
     * A null phone or skillIds value leaves that field unchanged.
     */
    @Transactional
    public Student updateOwnProfile(
            Long userId,
            String phone,
            Set<Long> skillIds
    ) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Student profile not found")
                );

        if (phone != null) {
            student.setPhone(phone);
        }

        if (skillIds != null) {
            Set<Skill> skills = new HashSet<>();

            for (Long skillId : skillIds) {
                if (skillId == null) {
                    throw new RuntimeException(
                            "Skill ID cannot be null"
                    );
                }

                Skill skill = skillRepository.findById(skillId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Skill not found: " + skillId
                                )
                        );

                skills.add(skill);
            }

            student.setSkills(skills);
        }

        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Optional<Student> getStudentByRollNumber(String rollNumber) {
        return studentRepository.findByRollNumber(rollNumber);
    }

    public Optional<Student> getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId);
    }

    public boolean existsByRollNumber(String rollNumber) {
        return studentRepository.existsByRollNumber(rollNumber);
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
}
