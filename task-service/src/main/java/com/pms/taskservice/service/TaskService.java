package com.pms.taskservice.service;

import com.pms.taskservice.dto.TaskRequest;
import com.pms.taskservice.dto.TaskResponse;
import com.pms.taskservice.dto.CommentRequest;
import com.pms.taskservice.dto.CommentResponse;
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
    List<TaskResponse> getAllTasks();

    List<TaskResponse> getTasksByTeam(String teamId);

    List<TaskResponse> getTasksByAssignedUser(Long userId);

    TaskResponse getTaskById(String taskId);

    // --- Security Helpers for @PreAuthorize ---
    boolean isTaskCreator(Authentication authentication, String taskId);

    boolean isAssignedToTask(Authentication authentication, String taskId);

    /**
     * True when caller is allowed to edit task fields (admin, task creator, or
     * task's team leader).
     */
    boolean canEditTask(Authentication authentication, String taskId);

    /**
     * True when caller can access a team-scoped listing (admin or member of that
     * team).
     */
    boolean canAccessTeam(Authentication authentication, String teamId);

    // --- Comments ---
    List<CommentResponse> getComments(String taskId);

    CommentResponse addComment(String taskId, Long authorId, CommentRequest request);

    // --- Security Helpers for comment endpoints ---
    boolean canViewTask(Authentication authentication, String taskId);

    boolean canCommentOnTask(Authentication authentication, String taskId);
}