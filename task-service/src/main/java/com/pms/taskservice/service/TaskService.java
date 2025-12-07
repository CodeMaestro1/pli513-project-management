package com.pms.taskservice.service;

import com.pms.taskservice.dto.TaskRequest;
import com.pms.taskservice.dto.TaskResponse;
import com.pms.taskservice.model.TaskStatus;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface TaskService {

    // --- CRUD Operations ---
    TaskResponse createTask(TaskRequest request, Long creatorId);

    TaskResponse updateTask(String taskId, TaskRequest request);

    TaskResponse updateTaskStatus(String taskId, TaskStatus status);

    void deleteTask(String taskId);

    // --- View / Filter Operations ---
    List<TaskResponse> getTasksByTeam(String teamId);

    List<TaskResponse> getTasksByAssignedUser(Long userId);

    TaskResponse getTaskById(String taskId);

    // --- Security Helpers for @PreAuthorize ---
    boolean isTaskCreator(Authentication authentication, String taskId);

    boolean isAssignedToTask(Authentication authentication, String taskId);
}