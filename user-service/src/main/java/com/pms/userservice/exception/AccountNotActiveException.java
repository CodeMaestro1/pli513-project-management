package com.pms.userservice.exception;

public class AccountNotActiveException extends RuntimeException {
    private final String code;

    public AccountNotActiveException(String message) {
        super(message);
        this.code = null;
    }

    public AccountNotActiveException(String message, String code) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}