
package com.placement.backend.service;

import com.placement.backend.dto.LoginRequestDTO;
import com.placement.backend.dto.RegisterRequestDTO;
import com.placement.backend.entity.Department;
import com.placement.backend.entity.Role;
import com.placement.backend.entity.Student;
import com.placement.backend.entity.User;
import com.placement.backend.repository.DepartmentRepository;
import com.placement.backend.repository.StudentRepository;
import com.placement.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Register a student account and create its student profile.
    @Transactional
    public User register(RegisterRequestDTO request) {

        if (request == null) {
            throw new RuntimeException(
                    "Registration details are required"
            );
        }

        if (request.getName() == null
                || request.getName().isBlank()
                || request.getEmail() == null
                || request.getEmail().isBlank()
                || request.getPassword() == null
                || request.getPassword().isBlank()
                || request.getRollNumber() == null
                || request.getRollNumber().isBlank()
                || request.getDepartmentId() == null) {

            throw new RuntimeException(
                    "Please provide all required registration details"
            );
        }

        String email = request.getEmail().trim();
        String rollNumber = request.getRollNumber().trim();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Email already exists"
            );
        }

        if (studentRepository.existsByRollNumber(rollNumber)) {
            throw new RuntimeException(
                    "Roll number already exists"
            );
        }

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found"
                        )
                );

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Public registration can only create STUDENT accounts.
        user.setRole(Role.STUDENT);
        user.setStatus(true);

        User savedUser = userRepository.save(user);

        Student student = new Student();
        student.setRollNumber(rollNumber);
        student.setPhone(request.getPhone());
        student.setYear(request.getYear());
        student.setCgpa(request.getCgpa());
        student.setUser(savedUser);
        student.setDepartment(department);

        studentRepository.save(student);

        return savedUser;
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
