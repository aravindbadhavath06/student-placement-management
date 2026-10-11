
package com.placement.backend.controller;

import com.placement.backend.dto.LoginRequestDTO;
import com.placement.backend.dto.RegisterRequestDTO;
import com.placement.backend.entity.User;
import com.placement.backend.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Register a new student and return safe user details.
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody RegisterRequestDTO request) {

        User user = authService.register(request);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("status", user.isStatus());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    // Login and return the JWT.
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody LoginRequestDTO request) {

        try {
            String token = authService.login(request);

            Map<String, String> response = new HashMap<>();
            response.put("token", token);

            return ResponseEntity.ok(response);

        } catch (RuntimeException ex) {

            Map<String, String> response = new HashMap<>();

            if ("Account is inactive".equals(ex.getMessage())) {
                response.put("error", "Account is inactive");

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(response);
            }

            response.put("error", "Invalid email or password");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }
    }
}
