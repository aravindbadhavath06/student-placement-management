package com.placement.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Authentication endpoints
                .requestMatchers("/api/auth/**").permitAll()

                // Student management
                .requestMatchers(
                    HttpMethod.POST, "/api/students"
                ).hasAnyRole("ADMIN", "OFFICER")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/students/**"
                ).hasRole("ADMIN")

                // Company management
                .requestMatchers(
                    HttpMethod.POST, "/api/companies"
                ).hasAnyRole("ADMIN", "OFFICER")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/companies/**"
                ).hasRole("ADMIN")

                // Job management
                .requestMatchers(
                    HttpMethod.POST, "/api/jobs"
                ).hasAnyRole("ADMIN", "OFFICER")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/jobs/**"
                ).hasAnyRole("ADMIN", "OFFICER")

                // Application management
                .requestMatchers(
                    HttpMethod.POST, "/api/applications"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/applications/**"
                ).hasAnyRole("ADMIN", "OFFICER")

                // Placement management
                .requestMatchers(
                    HttpMethod.POST, "/api/placements"
                ).hasAnyRole("ADMIN", "OFFICER")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/placements/**"
                ).hasRole("ADMIN")

                // Department management
                .requestMatchers(
                    HttpMethod.POST, "/api/departments"
                ).hasAnyRole("ADMIN", "OFFICER")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/departments/**"
                ).hasAnyRole("ADMIN", "OFFICER")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}