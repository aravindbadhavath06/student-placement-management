
package com.placement.backend.controller;

import com.placement.backend.entity.Company;
import com.placement.backend.service.CompanyService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    // Create a company (ADMIN/OFFICER permissions are in SecurityConfig)
    @PostMapping
    public ResponseEntity<?> createCompany(
            @RequestBody Company company) {

        if (company.getName() == null
                || company.getName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Company name cannot be empty");
        }

        if (company.getId() != null) {
            return ResponseEntity.badRequest()
                    .body("Company ID must not be supplied when creating");
        }

        company.setName(company.getName().trim());

        if (companyService.getCompanyByName(company.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Company already exists");
        }

        Company savedCompany = companyService.saveCompany(company);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedCompany);
    }

    // Get all companies (any authenticated role)
    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    // Get company by ID
    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(
            @PathVariable Long id) {

        return companyService.getCompanyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get company by name
    @GetMapping("/name/{name}")
    public ResponseEntity<Company> getCompanyByName(
            @PathVariable String name) {

        return companyService.getCompanyByName(name.trim())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete company (ADMIN permission is enforced in SecurityConfig)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCompany(
            @PathVariable Long id) {

        Optional<Company> company =
                companyService.getCompanyById(id);

        if (company.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        companyService.deleteCompany(id);

        return ResponseEntity.noContent().build();
    }
}
