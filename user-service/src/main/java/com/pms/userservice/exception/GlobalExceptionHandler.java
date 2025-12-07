package com.pms.userservice.exception;

import com.pms.userservice.dto.ErrorDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorDto> handleUserNotFound(
            UserNotFoundException ex) {

        ErrorDto error = ErrorDto.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.NOT_FOUND.value()) // 404
                .error("Not Found")
                .message(ex.getMessage())
                // 'path' field removed
                .build();

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorDto> handleDuplicateResource(
            DuplicateResourceException ex) {

        ErrorDto error = ErrorDto.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.CONFLICT.value()) // 409
                .error("Conflict")
                .message(ex.getMessage())
                .build();

        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorDto> handleInvalidCredentials(
            InvalidCredentialsException ex
    ){
        ErrorDto error = ErrorDto.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Unauthorized")
                .message(ex.getMessage())
                .build();

        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccountNotActiveException.class)
    public ResponseEntity<ErrorDto> handleAccountNotActive(AccountNotActiveException ex) {
        ErrorDto error = ErrorDto.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.FORBIDDEN.value()) // 403
                .error("Forbidden")
                .message(ex.getMessage()) // "Your account is pending approval..."
                .build();

        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }
}