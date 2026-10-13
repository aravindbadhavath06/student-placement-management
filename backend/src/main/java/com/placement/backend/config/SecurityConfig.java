
package com.placement.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
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
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow local development and deployed Vercel frontend.
        configuration.setAllowedOrigins(
            List.of(
                "http://localhost:5173",
                "https://student-placement-management-kohl.vercel.app"
            )
        );

        configuration.setAllowedMethods(
            List.of(
                "GET", "POST", "PUT", "PATCH",
                "DELETE", "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type",
                "Accept"
            )
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Public authentication endpoints.
                .requestMatchers("/api/auth/**").permitAll()

                // Public department list for student registration.
                .requestMatchers(
                    HttpMethod.GET, "/api/departments"
                ).permitAll()

                // Student management.
                .requestMatchers(
                    HttpMethod.POST, "/api/students"
                ).hasAnyRole("ADMIN", "OFFICER")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/students/**"
                ).hasRole("ADMIN")

                // Company management.
                .requestMatchers(
                    HttpMethod.POST, "/api/companies"
                ).hasAnyRole("ADMIN", "OFFICER")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/companies/**"
                ).hasRole("ADMIN")

                // Job management.
                .requestMatchers(
                    HttpMethod.POST, "/api/jobs"
                ).hasAnyRole("ADMIN", "OFFICER")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/jobs/**"
                ).hasAnyRole("ADMIN", "OFFICER")

                // Application management.
                .requestMatchers(
                    HttpMethod.POST, "/api/applications"
                ).hasRole("STUDENT")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/applications/**"
                ).hasAnyRole("ADMIN", "OFFICER")

                // Placement management.
                .requestMatchers(
                    HttpMethod.POST, "/api/placements"
                ).hasAnyRole("ADMIN", "OFFICER")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/placements/**"
                ).hasRole("ADMIN")

                // Department management.
                .requestMatchers(
                    HttpMethod.POST, "/api/departments"
                ).hasAnyRole("ADMIN", "OFFICER")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/departments/**"
                ).hasAnyRole("ADMIN", "OFFICER")

                // All other endpoints require authentication.
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
