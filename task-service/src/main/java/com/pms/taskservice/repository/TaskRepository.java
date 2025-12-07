package com.pms.taskservice.repository;

import com.pms.taskservice.model.Task;
import org.jspecify.annotations.NonNull;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<@NonNull Task, @NonNull String> {

    // Find all tasks for a specific team
    List<Task> findByTeamId(String teamId);

    // Find all tasks assigned to a specific user
    List<Task> findByAssignedToId(Long assignedToId);

    // Find all tasks created by a specific leader
    List<Task> findByCreatorId(Long creatorId);
}