package com.placement.backend.dto;

import com.placement.backend.entity.PlacementStatus;

import java.time.LocalDate;

public class PlacementDTO {

    private Long id;
    private Double packageAmount;
    private LocalDate placedAt;
    private PlacementStatus status;
    private Long studentId;
    private Long companyId;
    private Long jobId;

    public PlacementDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getPackageAmount() {
        return packageAmount;
    }

    public void setPackageAmount(Double packageAmount) {
        this.packageAmount = packageAmount;
    }

    public LocalDate getPlacedAt() {
        return placedAt;
    }

    public void setPlacedAt(LocalDate placedAt) {
        this.placedAt = placedAt;
    }

    public PlacementStatus getStatus() {
        return status;
    }

    public void setStatus(PlacementStatus status) {
        this.status = status;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }
}