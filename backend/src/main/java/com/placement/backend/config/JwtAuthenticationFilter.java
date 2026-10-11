
package com.placement.backend.config;

import com.placement.backend.entity.User;
import com.placement.backend.repository.UserRepository;
import com.placement.backend.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Check whether the Authorization header exists.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println(
                    "JWT DEBUG: Missing or invalid Authorization header for "
                    + request.getRequestURI()
            );

            filterChain.doFilter(request, response);
            return;
        }

        // Extract the JWT from the Bearer header.
        String token = authHeader.substring(7);

        // Validate the token.
        boolean valid = jwtService.isTokenValid(token);

        System.out.println(
                "JWT DEBUG: method=" + request.getMethod()
                + ", path=" + request.getRequestURI()
                + ", tokenValid=" + valid
        );

        if (valid) {

            // Extract the user's email from the token.
            String email = jwtService.extractEmail(token);

            // Find the user in the database.
            User user = userRepository.findByEmail(email).orElse(null);

            if (user != null && user.isStatus()) {

                // Assign the user's role as a Spring Security authority.
                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()
                        );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(authority)
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                // Mark the request as authenticated.
                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "JWT DEBUG: Authenticated user=" + email
                        + ", role=" + user.getRole()
                );

            } else {
                System.out.println(
                        "JWT DEBUG: User not found or account inactive"
                );
            }
        }

        // Continue processing the request.
        filterChain.doFilter(request, response);
    }
}
