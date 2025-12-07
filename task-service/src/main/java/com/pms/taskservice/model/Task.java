package com.pms.taskservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    private String title;
    private String description;

    private TaskStatus status;
    private Priority priority;

    private LocalDateTime dueDate; // For deadlines
    private Instant createdAt;
    private Instant updatedAt;

    // Relationships (Storing IDs only)
    private String teamId;      // Which team this belongs to
    private Long creatorId;     // Who created it (Team Leader)
    private Long assignedToId;  // Who acts on it
}