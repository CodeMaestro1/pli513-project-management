package com.pms.taskservice.controller;

import com.pms.taskservice.dto.CommentRequest;
import com.pms.taskservice.dto.CommentResponse;
import com.pms.taskservice.dto.TaskRequest;
import com.pms.taskservice.dto.TaskResponse;
import com.pms.taskservice.model.TaskStatus;
import com.pms.taskservice.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // --- 1. Create Task (Leader OR Admin) ---
    @PostMapping
    @PreAuthorize("@taskService.canCreateTask(authentication, #request)")
    public ResponseEntity<@NonNull TaskResponse> createTask(@RequestBody TaskRequest request, Authentication auth) {
        Long callerUserId = (Long) auth.getPrincipal();

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        Long effectiveCreatorId = callerUserId;
        if (isAdmin && request != null && request.getCreatorId() != null) {
            effectiveCreatorId = request.getCreatorId();
        }

        return new ResponseEntity<>(taskService.createTask(request, effectiveCreatorId), HttpStatus.CREATED);
    }

    // --- 2. Get Tasks by Team ---
    @GetMapping("/team/{teamId}")
    @PreAuthorize("@taskService.canAccessTeam(authentication, #teamId)")
    public ResponseEntity<@NonNull List<TaskResponse>> getTasksByTeam(
            @PathVariable String teamId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo) {
        return ResponseEntity.ok(taskService.getTasksByTeam(teamId, dueFrom, dueTo));
    }

    // --- 2b. Get All Tasks (Admin) ---
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<@NonNull List<TaskResponse>> getAllTasks(
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo) {
        return ResponseEntity.ok(taskService.getAllTasks(assignedToId, dueFrom, dueTo));
    }

    // --- 3. Get My Tasks ---
    @GetMapping("/my-tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<@NonNull List<TaskResponse>> getMyTasks(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(taskService.getTasksByAssignedUser(userId, dueFrom, dueTo));
    }

    // --- 4. Update Task Info (Creator Only) ---
    @PutMapping("/{taskId}")
    @PreAuthorize("@taskService.canEditTask(authentication, #taskId)")
    public ResponseEntity<@NonNull TaskResponse> updateTask(
            @PathVariable String taskId,
            @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(taskId, request));
    }

    // --- 5. Update Status (Creator OR Assigned User) ---
    @PatchMapping("/{taskId}/status")
    @PreAuthorize("@taskService.canEditTask(authentication, #taskId) or @taskService.isAssignedToTask(authentication, #taskId)")
    public ResponseEntity<@NonNull TaskResponse> updateTaskStatus(
            @PathVariable String taskId,
            @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(taskId, status));
    }

    // --- 6. Delete Task (Creator Only) ---
    @DeleteMapping("/{taskId}")
    @PreAuthorize("@taskService.isTaskCreator(authentication, #taskId)")
    public ResponseEntity<@NonNull Void> deleteTask(@PathVariable String taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    // --- 7. Task Comments ---
    @GetMapping("/{taskId}/comments")
    @PreAuthorize("@taskService.canViewTask(authentication, #taskId)")
    public ResponseEntity<@NonNull List<CommentResponse>> getComments(@PathVariable String taskId) {
        return ResponseEntity.ok(taskService.getComments(taskId));
    }

    @PostMapping("/{taskId}/comments")
    @PreAuthorize("@taskService.canCommentOnTask(authentication, #taskId)")
    public ResponseEntity<@NonNull CommentResponse> addComment(
            @PathVariable String taskId,
            @RequestBody CommentRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return new ResponseEntity<>(taskService.addComment(taskId, userId, request), HttpStatus.CREATED);
    }
}