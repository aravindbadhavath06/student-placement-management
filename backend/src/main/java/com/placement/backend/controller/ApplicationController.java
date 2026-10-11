package com.placement.backend.controller;

import com.placement.backend.dto.ApplicationDTO;
import com.placement.backend.entity.Application;
import com.placement.backend.entity.ApplicationStatus;
import com.placement.backend.entity.Job;
import com.placement.backend.entity.Student;
import com.placement.backend.entity.User;
import com.placement.backend.repository.JobRepository;
import com.placement.backend.repository.StudentRepository;
import com.placement.backend.repository.UserRepository;
import com.placement.backend.service.ApplicationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public ApplicationController(
            ApplicationService applicationService,
            StudentRepository studentRepository,
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.applicationService = applicationService;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // Apply for a job: students can apply only for themselves
    @PostMapping
    public ResponseEntity<?> applyForJob(
            @RequestBody ApplicationDTO applicationDTO,
            Authentication authentication) {

        Long jobId = applicationDTO.getJobId();

        if (jobId == null) {
            return ResponseEntity.badRequest()
                    .body("Job ID is required");
        }

        Optional<Student> currentStudentOptional =
                getCurrentStudent(authentication);

        if (currentStudentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No student profile found for this account");
        }

        Student student = currentStudentOptional.get();
        Long studentId = student.getId();

        Job job = jobRepository.findById(jobId)
                .orElse(null);

        if (job == null) {
            return ResponseEntity.badRequest()
                    .body("Job not found");
        }

        boolean alreadyApplied =
                applicationService.hasStudentApplied(studentId, jobId);

        if (alreadyApplied) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Student has already applied for this job");
        }

        Application application = new Application();
        application.setStudent(student);
        application.setJob(job);
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus(ApplicationStatus.APPLIED);

        Application savedApplication =
                applicationService.saveApplication(application);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToDTO(savedApplication));
    }

    // Get all applications: ADMIN and OFFICER only
    @GetMapping
    public ResponseEntity<?> getAllApplications(
            Authentication authentication) {

        if (!isAdminOrOfficer(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only ADMIN or OFFICER can view all applications");
        }

        List<ApplicationDTO> applications =
                applicationService.getAllApplications()
                        .stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(applications);
    }

    // Get application by ID: owner student or ADMIN/OFFICER
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplicationById(
            @PathVariable Long id,
            Authentication authentication) {

        Optional<Application> applicationOptional =
                applicationService.getApplicationById(id);

        if (applicationOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Application application = applicationOptional.get();

        if (!isAdminOrOfficer(authentication)) {
            Optional<Student> currentStudentOptional =
                    getCurrentStudent(authentication);

            if (currentStudentOptional.isEmpty()
                    || !application.getStudent().getId()
                            .equals(currentStudentOptional.get().getId())) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can access only your own applications");
            }
        }

        return ResponseEntity.ok(convertToDTO(application));
    }

    // Get applications by student ID: owner or ADMIN/OFFICER
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getApplicationsByStudentId(
            @PathVariable Long studentId,
            Authentication authentication) {

        if (!isAdminOrOfficer(authentication)) {
            Optional<Student> currentStudentOptional =
                    getCurrentStudent(authentication);

            if (currentStudentOptional.isEmpty()
                    || !currentStudentOptional.get().getId()
                            .equals(studentId)) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can access only your own applications");
            }
        }

        List<ApplicationDTO> applications =
                applicationService.getApplicationsByStudentId(studentId)
                        .stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(applications);
    }

    // Get applications by job ID: ADMIN/OFFICER only
    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getApplicationsByJobId(
            @PathVariable Long jobId,
            Authentication authentication) {

        if (!isAdminOrOfficer(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only ADMIN or OFFICER can view applications by job");
        }

        List<ApplicationDTO> applications =
                applicationService.getApplicationsByJobId(jobId)
                        .stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(applications);
    }

    // Delete application: ADMIN/OFFICER only
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(
            @PathVariable Long id) {

        if (applicationService.getApplicationById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        applicationService.deleteApplication(id);

        return ResponseEntity.noContent().build();
    }

    // Find the authenticated user's student profile
    private Optional<Student> getCurrentStudent(
            Authentication authentication) {

        if (authentication == null) {
            return Optional.empty();
        }

        Optional<User> userOptional =
                userRepository.findByEmail(authentication.getName());

        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        return studentRepository.findByUserId(
                userOptional.get().getId()
        );
    }

    // Check whether the current user is ADMIN or OFFICER
    private boolean isAdminOrOfficer(
            Authentication authentication) {

        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role ->
                        role.equals("ROLE_ADMIN")
                        || role.equals("ROLE_OFFICER"));
    }

    // Convert Application entity to safe DTO
    private ApplicationDTO convertToDTO(Application application) {

        ApplicationDTO dto = new ApplicationDTO();

        dto.setId(application.getId());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setStatus(application.getStatus());
        dto.setStudentId(application.getStudent().getId());
        dto.setJobId(application.getJob().getId());

        return dto;
    }
}