package com.pms.userservice.exception;

/**
 * Custom exception to be thrown when a resource (like a user)
 * already exists when it should be unique (e.g., duplicate email/username).
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}