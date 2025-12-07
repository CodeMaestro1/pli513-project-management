package com.pms.userservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Inject the service that knows how to handle JJWT versions correctly
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Early exit if no token found
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7); // Extract token

        // 2. Extract Username (Delegate to JwtService)
        // This avoids the "parserBuilder()" error because JwtService handles the parsing details
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // If token is invalid (expired, bad signature), don't crash.
            // Just proceed down the chain (Spring Security will catch the missing auth later).
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Authenticate if not already logged in
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load the user from DB
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // Validate token against user details
            if (jwtService.isTokenValid(jwt)) { //Neeeds to be fixed!!
                // This passes the roles (ADMIN, MEMBER) to Spring Security context
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Set the context so the user is now "Logged In"
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}