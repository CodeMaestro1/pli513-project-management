package com.pms.teamservice.repository;

import com.pms.teamservice.model.Team;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends MongoRepository<Team, String> {

    List<Team> findByMemberIdsContaining(Long userId);
}