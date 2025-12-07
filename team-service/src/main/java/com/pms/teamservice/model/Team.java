package com.pms.teamservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "teams") // This is for MongoDB
public class Team {



    @Id
    private String id; // MongoDB uses String for IDs by default

    private String name;
    private String description;
    private Instant createdAt;

    // We will store the User IDs directly
    private Long teamLeaderId;
    @Builder.Default
    private List<Long> memberIds = new ArrayList<>();
}