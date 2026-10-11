
package com.placement.backend.service;

import com.placement.backend.dto.LoginRequestDTO;
import com.placement.backend.dto.RegisterRequestDTO;
import com.placement.backend.entity.Role;
import com.placement.backend.entity.User;
import com.placement.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Register a new student
    public User register(RegisterRequestDTO request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Encode the password before saving it.
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Public registration can only create STUDENT accounts.
        user.setRole(Role.STUDENT);

        // Activate the newly registered account.
        user.setStatus(true);

        return userRepository.save(user);
    }

    // Authenticate an existing user and generate a JWT.
    public String login(LoginRequestDTO request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        // Reject inactive accounts.
        if (!user.isStatus()) {
            throw new RuntimeException(
                    "Account is inactive"
            );
        }

        // Verify the password.
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        // Generate a JWT only after successful validation.
        return jwtService.generateToken(user.getEmail());
    }
}
