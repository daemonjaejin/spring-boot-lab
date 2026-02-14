package com.example.demo.service;

import com.example.demo.dto.batch.BatchRunResponse;
import com.example.demo.entity.BatchJobDefinition;
import com.example.demo.repository.BatchJobDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BatchJobRunnerService {
    private final JobLauncher jobLauncher;
    private final BatchJobDefinitionRepository batchJobDefinitionRepository;
    private final Map<String, Job> registeredJobs;

    public void ensureRegisteredJobKey(String jobKey) {
        resolveJob(jobKey);
    }

    public BatchRunResponse runJob(BatchJobDefinition definition, String triggerType) {
        Job job = resolveJob(definition.getJobKey());
        try {
            JobExecution execution = jobLauncher.run(job, new JobParametersBuilder()
                    .addLong("requestedAt", System.currentTimeMillis())
                    .addString("triggerType", triggerType)
                    .addLong("batchJobId", definition.getId())
                    .toJobParameters());

            definition.setLastRunAt(Instant.now());
            batchJobDefinitionRepository.save(definition);

            return BatchRunResponse.builder()
                    .executionId(execution.getId())
                    .batchJobId(definition.getId())
                    .jobName(execution.getJobInstance() != null ? execution.getJobInstance().getJobName() : definition.getJobKey())
                    .status(execution.getStatus().name())
                    .exitCode(execution.getExitStatus() != null ? execution.getExitStatus().getExitCode() : null)
                    .createTime(execution.getCreateTime())
                    .startTime(execution.getStartTime())
                    .endTime(execution.getEndTime())
                    .build();
        } catch (Exception ex) {
            log.error("Batch execution failed. batchJobId={}, jobKey={}", definition.getId(), definition.getJobKey(), ex);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    extractMessage(ex),
                    ex
            );
        }
    }

    private Job resolveJob(String jobKey) {
        Job byBeanName = registeredJobs.get(jobKey);
        if (byBeanName != null) {
            return byBeanName;
        }

        return registeredJobs.values().stream()
                .filter(job -> job.getName().equals(jobKey))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Job bean not registered"));
    }

    private String extractMessage(Exception ex) {
        Throwable cursor = ex;
        while (cursor != null) {
            if (cursor.getMessage() != null && !cursor.getMessage().isBlank()) {
                return cursor.getMessage();
            }
            cursor = cursor.getCause();
        }
        return "Batch job execution failed: " + ex.getClass().getSimpleName();
    }
}
