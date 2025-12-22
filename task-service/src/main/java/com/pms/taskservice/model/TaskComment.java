package com.pms.taskservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "task_comments")
public class TaskComment {

    @Id
    private String id;

    private String taskId;
    private Long authorId;
    private String message;
    private Instant createdAt;
}
