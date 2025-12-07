package com.pms.userservice.exception;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter // Only generate a getter for statusCode
@NoArgsConstructor // If you need a default constructor
public class UserNotFoundException extends RuntimeException {

    private int statusCode;

    // Correctly sets the standard exception message
    public UserNotFoundException(String message) {
        super(message);
    }

    // Constructor to set both message and status code
    public UserNotFoundException(String message, int statusCode) {
        super(message); // Set the standard message
        this.statusCode = statusCode;
    }

    // It's also good practice to include a constructor that accepts a cause
    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public UserNotFoundException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }
}