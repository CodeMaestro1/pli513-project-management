package com.pms.taskservice.service.impl;

import com.pms.taskservice.client.TeamResponse;
import com.pms.taskservice.dto.TaskRequest;
import com.pms.taskservice.dto.TaskResponse;
import com.pms.taskservice.dto.CommentRequest;
import com.pms.taskservice.dto.CommentResponse;
import com.pms.taskservice.model.TaskComment;
import com.pms.taskservice.repository.TaskCommentRepository;
import com.pms.taskservice.model.Task;
import com.pms.taskservice.model.TaskStatus;
import com.pms.taskservice.repository.TaskRepository;
import com.pms.taskservice.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service("taskService") // Named for @PreAuthorize usage
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final RestTemplate restTemplate;
    private final MongoTemplate mongoTemplate;

    @Value("${application.config.team-service-url:http://team-service:8081}")
    private String teamServiceBaseUrl;

    @Override
    public TaskResponse createTask(TaskRequest request, Long creatorId) {
        Long assignedTo = request == null ? null : request.getAssignedToId();
        if (assignedTo == null) {
            assignedTo = creatorId;
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .teamId(request.getTeamId())
                .assignedToId(assignedTo)
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
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getAllTasks(Long assignedToId, LocalDate dueFrom, LocalDate dueTo) {
        if (assignedToId == null && dueFrom == null && dueTo == null) {
            return getAllTasks();
        }

        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();

        if (assignedToId != null) {
            criteria.add(Criteria.where("assignedToId").is(assignedToId));
        }

        Criteria due = dueDateCriteria(dueFrom, dueTo);
        if (due != null) {
            criteria.add(due);
        }

        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(query, Task.class).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByTeam(String teamId) {
        return taskRepository.findByTeamId(teamId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByTeam(String teamId, LocalDate dueFrom, LocalDate dueTo) {
        if (dueFrom == null && dueTo == null) {
            return getTasksByTeam(teamId);
        }

        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();
        criteria.add(Criteria.where("teamId").is(teamId));

        Criteria due = dueDateCriteria(dueFrom, dueTo);
        if (due != null) {
            criteria.add(due);
        }

        query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        return mongoTemplate.find(query, Task.class).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByAssignedUser(Long userId) {
        List<Task> result = new ArrayList<>();
        result.addAll(taskRepository.findByAssignedToId(userId));

        // Also include tasks assigned to teams the current user belongs to.
        // This enables: "a task assigned to a team should be visible to all the
        // members".
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && Objects.equals(auth.getPrincipal(), userId)) {
            List<String> teamIds = getMyTeamIds(auth);
            if (teamIds != null && !teamIds.isEmpty()) {
                result.addAll(taskRepository.findByTeamIdIn(teamIds));
            }
        }

        // De-dup by task id, preserve insertion order.
        Set<String> seen = new HashSet<>();
        return result.stream()
                .filter(t -> t != null && t.getId() != null && seen.add(t.getId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByAssignedUser(Long userId, LocalDate dueFrom, LocalDate dueTo) {
        if (dueFrom == null && dueTo == null) {
            return getTasksByAssignedUser(userId);
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !Objects.equals(auth.getPrincipal(), userId)) {
            // Preserve original semantics: only include team tasks when caller is the same
            // user.
            // If not, fall back to the direct assignment-only query.
            Query q = new Query();
            List<Criteria> criteria = new ArrayList<>();
            criteria.add(Criteria.where("assignedToId").is(userId));
            Criteria due = dueDateCriteria(dueFrom, dueTo);
            if (due != null)
                criteria.add(due);
            q.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
            return mongoTemplate.find(q, Task.class).stream().map(this::mapToResponse).collect(Collectors.toList());
        }

        List<String> teamIds = getMyTeamIds(auth);
        Criteria visible;
        if (teamIds != null && !teamIds.isEmpty()) {
            visible = new Criteria().orOperator(
                    Criteria.where("assignedToId").is(userId),
                    Criteria.where("teamId").in(teamIds));
        } else {
            visible = Criteria.where("assignedToId").is(userId);
        }

        Query q = new Query();
        List<Criteria> and = new ArrayList<>();
        and.add(visible);

        Criteria due = dueDateCriteria(dueFrom, dueTo);
        if (due != null) {
            and.add(due);
        }
        q.addCriteria(new Criteria().andOperator(and.toArray(new Criteria[0])));

        return mongoTemplate.find(q, Task.class).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Criteria dueDateCriteria(LocalDate dueFrom, LocalDate dueTo) {
        if (dueFrom == null && dueTo == null)
            return null;

        LocalDateTime from = dueFrom != null ? dueFrom.atStartOfDay() : null;
        LocalDateTime to = dueTo != null ? LocalDateTime.of(dueTo, LocalTime.of(23, 59, 59, 999_000_000)) : null;

        if (from != null && to != null) {
            return Criteria.where("dueDate").gte(from).lte(to);
        }
        if (from != null) {
            return Criteria.where("dueDate").gte(from);
        }
        return Criteria.where("dueDate").lte(to);
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

    @Override
    public boolean canViewTask(Authentication authentication, String taskId) {
        if (hasRole(authentication, "ROLE_ADMIN"))
            return true;

        if (isTaskCreator(authentication, taskId) || isAssignedToTask(authentication, taskId)) {
            return true;
        }

        Task task = getTaskEntity(taskId);
        if (task.getTeamId() != null) {
            return isMemberOfTeam(authentication, task.getTeamId());
        }

        return false;
    }

    @Override
    public boolean canCommentOnTask(Authentication authentication, String taskId) {
        return canViewTask(authentication, taskId);
    }

    @Override
    public boolean canEditTask(Authentication authentication, String taskId) {
        if (hasRole(authentication, "ROLE_ADMIN"))
            return true;
        if (isTaskCreator(authentication, taskId))
            return true;

        Task task = getTaskEntity(taskId);
        if (task.getTeamId() == null)
            return false;

        return isLeaderOfTeam(authentication, task.getTeamId());
    }

    @Override
    public boolean canAccessTeam(Authentication authentication, String teamId) {
        if (hasRole(authentication, "ROLE_ADMIN"))
            return true;
        return isMemberOfTeam(authentication, teamId);
    }

    @Override
    public boolean canCreateTask(Authentication authentication, TaskRequest request) {
        if (hasRole(authentication, "ROLE_ADMIN") || hasRole(authentication, "ROLE_LEADER"))
            return true;
        if (authentication == null)
            return false;
        Long callerUserId = (Long) authentication.getPrincipal();
        if (request == null)
            return false;
        Long creatorId = request.getCreatorId();
        return creatorId == null || Objects.equals(creatorId, callerUserId);
    }

    private boolean hasRole(Authentication authentication, String role) {
        if (authentication == null || authentication.getAuthorities() == null)
            return false;
        return authentication.getAuthorities().stream().anyMatch(a -> role.equals(a.getAuthority()));
    }

    private String getJwt(Authentication authentication) {
        if (authentication == null)
            return null;
        Object creds = authentication.getCredentials();
        if (creds instanceof String s && !s.isBlank()) {
            return s;
        }
        return null;
    }

    private Optional<TeamResponse> getTeamForCurrentUser(Authentication authentication, String teamId) {
        String jwt = getJwt(authentication);
        if (jwt == null || teamId == null)
            return Optional.empty();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(jwt);

            String url = teamServiceBaseUrl;
            if (url.endsWith("/")) {
                url = url.substring(0, url.length() - 1);
            }
            url = url + "/api/v1/teams/my-teams";

            ResponseEntity<TeamResponse[]> res = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    TeamResponse[].class);

            TeamResponse[] teams = res.getBody();
            if (teams == null)
                return Optional.empty();

            for (TeamResponse t : teams) {
                if (t != null && t.getId() != null && teamId.equals(String.valueOf(t.getId()))) {
                    return Optional.of(t);
                }
            }

            return Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private List<String> getMyTeamIds(Authentication authentication) {
        String jwt = getJwt(authentication);
        if (jwt == null)
            return List.of();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(jwt);

            String url = teamServiceBaseUrl;
            if (url.endsWith("/")) {
                url = url.substring(0, url.length() - 1);
            }
            url = url + "/api/v1/teams/my-teams";

            ResponseEntity<TeamResponse[]> res = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    TeamResponse[].class);

            TeamResponse[] teams = res.getBody();
            if (teams == null || teams.length == 0)
                return List.of();

            List<String> ids = new ArrayList<>();
            for (TeamResponse t : teams) {
                if (t != null && t.getId() != null) {
                    ids.add(String.valueOf(t.getId()));
                }
            }
            return ids;
        } catch (Exception e) {
            return List.of();
        }
    }

    private boolean isMemberOfTeam(Authentication authentication, String teamId) {
        return getTeamForCurrentUser(authentication, teamId).isPresent();
    }

    private boolean isLeaderOfTeam(Authentication authentication, String teamId) {
        Long currentUserId = authentication == null ? null : (Long) authentication.getPrincipal();
        if (currentUserId == null)
            return false;

        return getTeamForCurrentUser(authentication, teamId)
                .map(t -> Objects.equals(t.getTeamLeaderId(), currentUserId))
                .orElse(false);
    }

    // --- Comments ---

    @Override
    public List<CommentResponse> getComments(String taskId) {
        return taskCommentRepository.findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CommentResponse addComment(String taskId, Long authorId, CommentRequest request) {
        // Ensure task exists
        getTaskEntity(taskId);

        String msg = request == null ? null : request.getMessage();
        if (msg == null || msg.trim().isEmpty()) {
            throw new RuntimeException("Comment message is required");
        }

        TaskComment c = TaskComment.builder()
                .taskId(taskId)
                .authorId(authorId)
                .message(msg.trim())
                .createdAt(Instant.now())
                .build();

        return mapToCommentResponse(taskCommentRepository.save(c));
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
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private CommentResponse mapToCommentResponse(TaskComment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .taskId(c.getTaskId())
                .authorId(c.getAuthorId())
                .message(c.getMessage())
                .createdAt(c.getCreatedAt())
                .build();
    }
}