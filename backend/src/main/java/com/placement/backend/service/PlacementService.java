package com.placement.backend.service;

import com.placement.backend.entity.Placement;
import com.placement.backend.repository.PlacementRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlacementService {

    private final PlacementRepository placementRepository;

    public PlacementService(PlacementRepository placementRepository) {
        this.placementRepository = placementRepository;
    }

    public Placement savePlacement(Placement placement) {
        return placementRepository.save(placement);
    }

    public List<Placement> getAllPlacements() {
        return placementRepository.findAll();
    }

    public Optional<Placement> getPlacementById(Long id) {
        return placementRepository.findById(id);
    }

    public Optional<Placement> getPlacementByStudentId(Long studentId) {
        return placementRepository.findByStudentId(studentId);
    }

    public boolean existsByStudentId(Long studentId) {
        return placementRepository.existsByStudentId(studentId);
    }

    public void deletePlacement(Long id) {
        placementRepository.deleteById(id);
    }
}