package com.pms.taskservice.repository;

import com.pms.taskservice.model.TaskComment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskCommentRepository extends MongoRepository<TaskComment, String> {
    List<TaskComment> findByTaskIdOrderByCreatedAtDesc(String taskId);
}
