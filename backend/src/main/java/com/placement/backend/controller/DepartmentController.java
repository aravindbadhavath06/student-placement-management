
package com.placement.backend.controller;

import com.placement.backend.dto.DepartmentDTO;
import com.placement.backend.entity.Department;
import com.placement.backend.service.DepartmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    // Create a department
    @PostMapping
    public ResponseEntity<?> createDepartment(
            @RequestBody DepartmentDTO departmentDTO) {

        if (departmentDTO.getName() == null
                || departmentDTO.getName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Department name cannot be empty");
        }

        String name = departmentDTO.getName().trim();

        if (departmentService.existsByName(name)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Department already exists");
        }

        Department department = new Department();
        department.setName(name);

        Department savedDepartment =
                departmentService.saveDepartment(department);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToDTO(savedDepartment));
    }

    // Get all departments
    @GetMapping
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments() {

        List<DepartmentDTO> departments =
                departmentService.getAllDepartments()
                        .stream()
                        .map(this::convertToDTO)
                        .toList();

        return ResponseEntity.ok(departments);
    }

    // Get department by ID
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDTO> getDepartmentById(
            @PathVariable Long id) {

        return departmentService.getDepartmentById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get department by name
    @GetMapping("/name/{name}")
    public ResponseEntity<DepartmentDTO> getDepartmentByName(
            @PathVariable String name) {

        return departmentService.getDepartmentByName(name)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete department by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(
            @PathVariable Long id) {

        if (departmentService.getDepartmentById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    // Convert Department entity to DTO
    private DepartmentDTO convertToDTO(Department department) {

        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setName(department.getName());

        return dto;
    }
}
