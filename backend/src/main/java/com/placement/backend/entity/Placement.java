package com.placement.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "placements",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id"})
    }
)
public class Placement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double packageAmount;

    private LocalDate placedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlacementStatus status;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    public Placement() {
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

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }
}