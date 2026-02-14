package com.example.demo.dto.batch;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class BatchRunResponse {
    Long executionId;
    Long batchJobId;
    String jobName;
    String status;
    String exitCode;
    LocalDateTime createTime;
    LocalDateTime startTime;
    LocalDateTime endTime;
}

