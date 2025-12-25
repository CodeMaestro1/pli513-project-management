package com.pms.taskservice.service;

import com.pms.taskservice.dto.TaskRequest;
import com.pms.taskservice.dto.TaskResponse;
import com.pms.taskservice.dto.CommentRequest;
import com.pms.taskservice.dto.CommentResponse;
import com.pms.taskservice.model.TaskStatus;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.List;

public interface TaskService {

    // --- CRUD Operations ---
    TaskResponse createTask(TaskRequest request, Long creatorId);

    TaskResponse updateTask(String taskId, TaskRequest request);

    TaskResponse updateTaskStatus(String taskId, TaskStatus status);

    void deleteTask(String taskId);

    // --- View / Filter Operations ---
    List<TaskResponse> getAllTasks();

    /**
     * Optional server-side filters for admin listing. If all filters are null,
     * returns the same as {@link #getAllTasks()}.
     */
    List<TaskResponse> getAllTasks(Long assignedToId, LocalDate dueFrom, LocalDate dueTo);

    List<TaskResponse> getTasksByTeam(String teamId);

    /**
     * Optional server-side due-date range filter for team listing.
     */
    List<TaskResponse> getTasksByTeam(String teamId, LocalDate dueFrom, LocalDate dueTo);

    List<TaskResponse> getTasksByAssignedUser(Long userId);

    /**
     * Optional server-side due-date range filter for "my tasks" listing.
     */
    List<TaskResponse> getTasksByAssignedUser(Long userId, LocalDate dueFrom, LocalDate dueTo);

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

    /**
     * True when caller is allowed to create a task. Admins and leaders may create
     * tasks for others; regular authenticated users may create personal tasks
     * (creatorId omitted or equal to caller).
     */
    boolean canCreateTask(Authentication authentication, com.pms.taskservice.dto.TaskRequest request);

    // --- Comments ---
    List<CommentResponse> getComments(String taskId);

    CommentResponse addComment(String taskId, Long authorId, CommentRequest request);

    // --- Security Helpers for comment endpoints ---
    boolean canViewTask(Authentication authentication, String taskId);

    boolean canCommentOnTask(Authentication authentication, String taskId);
}