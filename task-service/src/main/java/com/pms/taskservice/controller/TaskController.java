package com.pms.taskservice.controller;

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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // --- 1. Create Task (Leader Only) ---
    @PostMapping
    @PreAuthorize("hasRole('LEADER')")
    public ResponseEntity<@NonNull TaskResponse> createTask(@RequestBody TaskRequest request, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return new ResponseEntity<>(taskService.createTask(request, userId), HttpStatus.CREATED);
    }

    // --- 2. Get Tasks by Team ---
    @GetMapping("/team/{teamId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<@NonNull List< TaskResponse>> getTasksByTeam(@PathVariable String teamId) {
        return ResponseEntity.ok(taskService.getTasksByTeam(teamId));
    }

    // --- 3. Get My Tasks ---
    @GetMapping("/my-tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<@NonNull List<TaskResponse>> getMyTasks(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(taskService.getTasksByAssignedUser(userId));
    }

    // --- 4. Update Task Info (Creator Only) ---
    @PutMapping("/{taskId}")
    @PreAuthorize("@taskService.isTaskCreator(authentication, #taskId)")
    public ResponseEntity<@NonNull TaskResponse> updateTask(
            @PathVariable String taskId,
            @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(taskId, request));
    }

    // --- 5. Update Status (Creator OR Assigned User) ---
    @PatchMapping("/{taskId}/status")
    @PreAuthorize("@taskService.isTaskCreator(authentication, #taskId) or @taskService.isAssignedToTask(authentication, #taskId)")
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
}