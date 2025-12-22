package com.pms.userservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class PublicNamesRequest {
    private List<Long> ids;
}
