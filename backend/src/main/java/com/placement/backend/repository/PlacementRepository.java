package com.placement.backend.repository;

import com.placement.backend.entity.Placement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlacementRepository extends JpaRepository<Placement, Long> {

    Optional<Placement> findByStudentId(Long studentId);

    boolean existsByStudentId(Long studentId);
}