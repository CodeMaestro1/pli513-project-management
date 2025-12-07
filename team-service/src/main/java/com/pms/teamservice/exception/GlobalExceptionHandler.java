package com.pms.teamservice.exception;

import com.pms.teamservice.dto.ErrorDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles AccessDeniedException (403 FORBIDDEN).
     * This is thrown by @PreAuthorize when a user has a valid token
     * but does not have the required role (e.g., a MEMBER trying an ADMIN action).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDto> handleAccessDenied(AccessDeniedException ex) {

        ErrorDto error = ErrorDto.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.FORBIDDEN.value()) // 403
                .error("Forbidden")
                .message("Access Denied: You do not have permission to perform this action.")
                .build();

        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    /**
     * Handles generic RuntimeExceptions (500 INTERNAL SERVER ERROR).
     * This is a catch-all for any unexpected errors.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorDto> handleRuntimeException(RuntimeException ex) {

        ErrorDto error = ErrorDto.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value()) // 500
                .error("Internal Server Error")
                .message("An unexpected error occurred: " + ex.getMessage())
                .build();

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // You can add more specific handlers here as needed
    // (e.g., ResourceNotFoundException -> 404 NOT FOUND)
}