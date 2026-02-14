package com.example.demo.dto.batch;

import com.example.demo.entity.BatchJobDefinition;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class BatchJobResponse {
    Long id;
    String name;
    String jobKey;
    String jobClass;
    String cronExpression;
    Boolean enabled;
    Instant lastRunAt;
    Instant createdAt;
    Instant updatedAt;

    public static BatchJobResponse from(BatchJobDefinition definition) {
        return BatchJobResponse.builder()
                .id(definition.getId())
                .name(definition.getName())
                .jobKey(definition.getJobKey())
                .jobClass(definition.getJobClass())
                .cronExpression(definition.getCronExpression())
                .enabled(definition.getEnabled())
                .lastRunAt(definition.getLastRunAt())
                .createdAt(definition.getCreatedAt())
                .updatedAt(definition.getUpdatedAt())
                .build();
    }
}

