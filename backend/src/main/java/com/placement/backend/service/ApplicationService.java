package com.placement.backend.service;

import com.placement.backend.entity.Application;
import com.placement.backend.repository.ApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public Application saveApplication(Application application) {
        return applicationRepository.save(application);
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Optional<Application> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    public List<Application> getApplicationsByStudentId(Long studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    public List<Application> getApplicationsByJobId(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public Optional<Application> getApplicationByStudentAndJob(
            Long studentId, Long jobId) {
        return applicationRepository.findByStudentIdAndJobId(studentId, jobId);
    }

    public boolean hasStudentApplied(Long studentId, Long jobId) {
        return applicationRepository.existsByStudentIdAndJobId(studentId, jobId);
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }
}