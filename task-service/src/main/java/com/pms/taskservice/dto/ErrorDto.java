package com.pms.taskservice.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class ErrorDto {
    private Instant timestamp;
    private int status;
    private String error;
    private String message;
}