package com.pms.taskservice.service.impl;

import com.pms.taskservice.dto.TaskRequest;
import com.pms.taskservice.dto.TaskResponse;
import com.pms.taskservice.model.Task;
import com.pms.taskservice.model.TaskStatus;
import com.pms.taskservice.repository.TaskRepository;
import com.pms.taskservice.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service("taskService") // Named for @PreAuthorize usage
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    @Override
    public TaskResponse createTask(TaskRequest request, Long creatorId) {
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .teamId(request.getTeamId())
                .assignedToId(request.getAssignedToId())
                .creatorId(creatorId)
                .status(TaskStatus.TODO) // Default status per requirements
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Task savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);
    }

    @Override
    public TaskResponse updateTask(String taskId, TaskRequest request) {
        Task task = getTaskEntity(taskId);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setAssignedToId(request.getAssignedToId());

        // Only update status if provided, otherwise keep existing
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        task.setUpdatedAt(Instant.now());

        return mapToResponse(taskRepository.save(task));
    }

    @Override
    public TaskResponse updateTaskStatus(String taskId, TaskStatus status) {
        Task task = getTaskEntity(taskId);
        task.setStatus(status);
        task.setUpdatedAt(Instant.now());
        return mapToResponse(taskRepository.save(task));
    }

    @Override
    public void deleteTask(String taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found with id: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    @Override
    public List<TaskResponse> getTasksByTeam(String teamId) {
        return taskRepository.findByTeamId(teamId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByAssignedUser(Long userId) {
        return taskRepository.findByAssignedToId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponse getTaskById(String taskId) {
        return mapToResponse(getTaskEntity(taskId));
    }

    // --- Security Helpers ---

    @Override
    public boolean isTaskCreator(Authentication authentication, String taskId) {
        Long currentUserId = (Long) authentication.getPrincipal();
        Task task = getTaskEntity(taskId);
        return Objects.equals(task.getCreatorId(), currentUserId);
    }

    @Override
    public boolean isAssignedToTask(Authentication authentication, String taskId) {
        Long currentUserId = (Long) authentication.getPrincipal();
        Task task = getTaskEntity(taskId);
        return Objects.equals(task.getAssignedToId(), currentUserId);
    }

    // --- Private Helpers ---

    private Task getTaskEntity(String id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .teamId(task.getTeamId())
                .creatorId(task.getCreatorId())
                .assignedToId(task.getAssignedToId())
                .createdAt(task.getCreatedAt())
                .build();
    }
}