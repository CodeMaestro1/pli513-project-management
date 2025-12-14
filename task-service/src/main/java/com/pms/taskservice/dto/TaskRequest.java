package com.pms.taskservice.dto;

import com.pms.taskservice.model.Priority;
import com.pms.taskservice.model.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskRequest {
    private String title;
    private String description;
    private Priority priority;
    private LocalDateTime dueDate;
    private String teamId; // Required for creation
    private Long assignedToId; // Optional on creation
    private TaskStatus status; // Optional (defaults on creation)
}