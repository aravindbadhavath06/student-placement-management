package com.placement.backend.controller;

import com.placement.backend.dto.PlacementDTO;
import com.placement.backend.entity.Company;
import com.placement.backend.entity.Job;
import com.placement.backend.entity.Placement;
import com.placement.backend.entity.Student;
import com.placement.backend.entity.User;
import com.placement.backend.repository.CompanyRepository;
import com.placement.backend.repository.JobRepository;
import com.placement.backend.repository.StudentRepository;
import com.placement.backend.repository.UserRepository;
import com.placement.backend.service.PlacementService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/placements")
public class PlacementController {

    private final PlacementService placementService;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public PlacementController(
            PlacementService placementService,
            StudentRepository studentRepository,
            CompanyRepository companyRepository,
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.placementService = placementService;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // Create a placement: ADMIN or OFFICER
    @PostMapping
    public ResponseEntity<?> createPlacement(
            @RequestBody PlacementDTO dto) {

        if (dto.getStudentId() == null
                || dto.getCompanyId() == null
                || dto.getJobId() == null
                || dto.getStatus() == null) {

            return ResponseEntity.badRequest()
                    .body("Student ID, Company ID, Job ID, and status are required");
        }

        if (placementService.existsByStudentId(dto.getStudentId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Student already has a placement record");
        }

        Student student = studentRepository
                .findById(dto.getStudentId())
                .orElse(null);

        if (student == null) {
            return ResponseEntity.badRequest()
                    .body("Student not found");
        }

        Company company = companyRepository
                .findById(dto.getCompanyId())
                .orElse(null);

        if (company == null) {
            return ResponseEntity.badRequest()
                    .body("Company not found");
        }

        Job job = jobRepository
                .findById(dto.getJobId())
                .orElse(null);

        if (job == null) {
            return ResponseEntity.badRequest()
                    .body("Job not found");
        }

        if (job.getCompany() == null
                || !job.getCompany().getId().equals(company.getId())) {

            return ResponseEntity.badRequest()
                    .body("The selected job does not belong to this company");
        }

        Placement placement = new Placement();
        placement.setStudent(student);
        placement.setCompany(company);
        placement.setJob(job);
        placement.setPackageAmount(dto.getPackageAmount());
        placement.setPlacedAt(
                dto.getPlacedAt() != null
                        ? dto.getPlacedAt()
                        : LocalDate.now()
        );
        placement.setStatus(dto.getStatus());

        Placement savedPlacement =
                placementService.savePlacement(placement);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToDTO(savedPlacement));
    }

    // Get all placements: ADMIN or OFFICER
    @GetMapping
    public ResponseEntity<?> getAllPlacements(
            Authentication authentication) {

        if (!isAdminOrOfficer(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only ADMIN or OFFICER can view all placements");
        }

        List<PlacementDTO> placements =
                placementService.getAllPlacements()
                        .stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(placements);
    }

    // Get placement by ID: ADMIN/OFFICER or owning student
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlacementById(
            @PathVariable Long id,
            Authentication authentication) {

        Optional<Placement> placementOptional =
                placementService.getPlacementById(id);

        if (placementOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Placement placement = placementOptional.get();

        if (!isAdminOrOfficer(authentication)) {
            Optional<Student> currentStudent =
                    getCurrentStudent(authentication);

            if (currentStudent.isEmpty()
                    || !placement.getStudent().getId()
                            .equals(currentStudent.get().getId())) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can access only your own placement");
            }
        }

        return ResponseEntity.ok(convertToDTO(placement));
    }

    // Get placement by student ID: ADMIN/OFFICER or owning student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getPlacementByStudentId(
            @PathVariable Long studentId,
            Authentication authentication) {

        if (!isAdminOrOfficer(authentication)) {
            Optional<Student> currentStudent =
                    getCurrentStudent(authentication);

            if (currentStudent.isEmpty()
                    || !currentStudent.get().getId().equals(studentId)) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can access only your own placement");
            }
        }

        return placementService.getPlacementByStudentId(studentId)
                .map(this::convertToDTO)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete placement: ADMIN only
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlacement(
            @PathVariable Long id) {

        if (placementService.getPlacementById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        placementService.deletePlacement(id);

        return ResponseEntity.noContent().build();
    }

    private Optional<Student> getCurrentStudent(
            Authentication authentication) {

        if (authentication == null) {
            return Optional.empty();
        }

        Optional<User> user =
                userRepository.findByEmail(authentication.getName());

        if (user.isEmpty()) {
            return Optional.empty();
        }

        return studentRepository.findByUserId(user.get().getId());
    }

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

    private PlacementDTO convertToDTO(Placement placement) {
        PlacementDTO dto = new PlacementDTO();

        dto.setId(placement.getId());
        dto.setPackageAmount(placement.getPackageAmount());
        dto.setPlacedAt(placement.getPlacedAt());
        dto.setStatus(placement.getStatus());
        dto.setStudentId(placement.getStudent().getId());
        dto.setCompanyId(placement.getCompany().getId());
        dto.setJobId(placement.getJob().getId());

        return dto;
    }
}