package com.pms.taskservice.dto;

import com.pms.taskservice.model.Priority;
import com.pms.taskservice.model.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskResponse {
    private String id;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private LocalDateTime dueDate;
    private String teamId;
    private Long creatorId;
    private Long assignedToId;
    private Instant createdAt;
    private Instant updatedAt;
}