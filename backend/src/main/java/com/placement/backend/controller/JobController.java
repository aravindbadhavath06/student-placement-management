
package com.placement.backend.controller;

import com.placement.backend.dto.JobDTO;
import com.placement.backend.entity.Company;
import com.placement.backend.entity.Job;
import com.placement.backend.repository.CompanyRepository;
import com.placement.backend.service.JobService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final CompanyRepository companyRepository;

    public JobController(
            JobService jobService,
            CompanyRepository companyRepository) {
        this.jobService = jobService;
        this.companyRepository = companyRepository;
    }

    @PostMapping
    public ResponseEntity<?> createJob(
            @RequestBody JobDTO jobDTO) {

        Company company = companyRepository
                .findById(jobDTO.getCompanyId())
                .orElse(null);

        if (company == null) {
            return ResponseEntity.badRequest()
                    .body("Company not found");
        }

        Job job = new Job();
        job.setTitle(jobDTO.getTitle());
        job.setDescription(jobDTO.getDescription());
        job.setPackageAmount(jobDTO.getPackageAmount());
        job.setLocation(jobDTO.getLocation());
        job.setMinimumCgpa(jobDTO.getMinimumCgpa());
        job.setDeadline(jobDTO.getDeadline());
        job.setCompany(company);

        Job savedJob = jobService.saveJob(job);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedJob);
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {

        return ResponseEntity.ok(
                jobService.getAllJobs()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(
            @PathVariable Long id) {

        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Job>> getJobsByCompanyId(
            @PathVariable Long companyId) {

        return ResponseEntity.ok(
                jobService.getJobsByCompanyId(companyId)
        );
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<Job>> getJobsByLocation(
            @PathVariable String location) {

        return ResponseEntity.ok(
                jobService.getJobsByLocation(location)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id) {

        if (jobService.getJobById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        jobService.deleteJob(id);

        return ResponseEntity.noContent().build();
    }
}