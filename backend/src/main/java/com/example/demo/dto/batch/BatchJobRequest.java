package com.example.demo.dto.batch;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BatchJobRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String jobKey;

    @NotBlank
    private String jobClass;

    @NotBlank
    private String cronExpression;

    private Boolean enabled = Boolean.TRUE;
}

