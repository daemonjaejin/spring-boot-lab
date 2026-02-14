package com.example.demo.service;

import com.example.demo.dto.batch.BatchExecutionResponse;
import com.example.demo.dto.batch.BatchJobRequest;
import com.example.demo.dto.batch.BatchJobResponse;
import com.example.demo.dto.batch.BatchRunResponse;
import com.example.demo.entity.BatchJobDefinition;
import com.example.demo.repository.BatchJobDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobInstance;
import org.springframework.batch.core.JobParameter;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatchJobService {
    private final BatchJobDefinitionRepository batchJobDefinitionRepository;
    private final BatchJobRunnerService batchJobRunnerService;
    private final JobExplorer jobExplorer;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    /**
     * Returns all batch job definitions.
     * 배치 작업 정의 목록을 조회한다.
     */
    public List<BatchJobResponse> listJobs() {
        return batchJobDefinitionRepository.findAll().stream()
                .map(BatchJobResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    /**
     * Returns one batch job definition by id.
     * id 기준으로 단일 배치 작업 정의를 조회한다.
     */
    public BatchJobResponse getJob(Long id) {
        return BatchJobResponse.from(requireJobDefinition(id));
    }

    @Transactional
    /**
     * Creates a new batch job definition.
     * 새로운 배치 작업 정의를 생성한다.
     */
    public BatchJobResponse createJob(BatchJobRequest request) {
        if (batchJobDefinitionRepository.existsByJobKey(request.getJobKey())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jobKey already exists");
        }

        String normalizedCron = validateAndNormalizeCron(request.getCronExpression());
        validateJobClassAndBean(request.getJobClass(), request.getJobKey());

        BatchJobDefinition definition = new BatchJobDefinition();
        applyRequest(definition, request, normalizedCron);
        BatchJobDefinition saved = batchJobDefinitionRepository.save(definition);
        eventPublisher.publishEvent(new BatchJobsChangedEvent());
        return BatchJobResponse.from(saved);
    }

    @Transactional
    /**
     * Updates an existing batch job definition.
     * 기존 배치 작업 정의를 수정한다.
     */
    public BatchJobResponse updateJob(Long id, BatchJobRequest request) {
        BatchJobDefinition definition = requireJobDefinition(id);
        if (batchJobDefinitionRepository.existsByJobKeyAndIdNot(request.getJobKey(), id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jobKey already exists");
        }

        String normalizedCron = validateAndNormalizeCron(request.getCronExpression());
        validateJobClassAndBean(request.getJobClass(), request.getJobKey());

        applyRequest(definition, request, normalizedCron);
        BatchJobDefinition saved = batchJobDefinitionRepository.save(definition);
        eventPublisher.publishEvent(new BatchJobsChangedEvent());
        return BatchJobResponse.from(saved);
    }

    @Transactional
    /**
     * Deletes one batch job definition.
     * 단일 배치 작업 정의를 삭제한다.
     */
    public void deleteJob(Long id) {
        BatchJobDefinition definition = requireJobDefinition(id);
        try {
            batchJobDefinitionRepository.delete(definition);
            eventPublisher.publishEvent(new BatchJobsChangedEvent());
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete job because it is referenced", ex);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete batch job", ex);
        }
    }

    public BatchRunResponse runNow(Long id) {
        BatchJobDefinition definition = requireJobDefinition(id);
        return batchJobRunnerService.runJob(definition, "MANUAL");
    }

    @Transactional(readOnly = true)
    public List<BatchExecutionResponse> listExecutions() {
        Map<String, BatchJobDefinition> jobsByKey = batchJobDefinitionRepository.findAll().stream()
                .collect(Collectors.toMap(BatchJobDefinition::getJobKey, Function.identity(), (left, right) -> left));

        List<BatchExecutionResponse> executions = new ArrayList<>();
        for (String jobName : jobExplorer.getJobNames()) {
            List<JobInstance> instances = jobExplorer.getJobInstances(jobName, 0, 50);
            for (JobInstance instance : instances) {
                for (JobExecution execution : jobExplorer.getJobExecutions(instance)) {
                    BatchJobDefinition definition = jobsByKey.get(instance.getJobName());
                    Long batchJobId = extractBatchJobId(execution);
                    if (batchJobId == null && definition != null) {
                        batchJobId = definition.getId();
                    }
                    executions.add(BatchExecutionResponse.builder()
                            .executionId(execution.getId())
                            .batchJobId(batchJobId)
                            .jobName(instance.getJobName())
                            .status(execution.getStatus().name())
                            .exitCode(execution.getExitStatus() != null ? execution.getExitStatus().getExitCode() : null)
                            .createTime(execution.getCreateTime())
                            .startTime(execution.getStartTime())
                            .endTime(execution.getEndTime())
                            .build());
                }
            }
        }

        executions.sort(Comparator
                .comparing(BatchExecutionResponse::getCreateTime, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(BatchExecutionResponse::getExecutionId, Comparator.nullsLast(Comparator.reverseOrder())));
        return executions;
    }

    @Transactional(readOnly = true)
    public List<BatchJobDefinition> listEnabledJobs() {
        return batchJobDefinitionRepository.findAllByEnabledTrue();
    }

    public BatchRunResponse runScheduled(Long id) {
        BatchJobDefinition definition = requireJobDefinition(id);
        if (!Boolean.TRUE.equals(definition.getEnabled())) {
            throw new IllegalArgumentException("Job is disabled");
        }
        return batchJobRunnerService.runJob(definition, "SCHEDULED");
    }

    private BatchJobDefinition requireJobDefinition(Long id) {
        return batchJobDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch job not found"));
    }

    private void applyRequest(BatchJobDefinition definition, BatchJobRequest request, String normalizedCron) {
        definition.setName(request.getName().trim());
        definition.setJobKey(request.getJobKey().trim());
        definition.setJobClass(request.getJobClass().trim());
        definition.setCronExpression(normalizedCron);
        definition.setEnabled(request.getEnabled() == null || request.getEnabled());
    }

    private void validateJobClassAndBean(String jobClass, String jobKey) {
        try {
            Class.forName(jobClass.trim());
        } catch (ClassNotFoundException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job class not found or not registered as Spring Batch Job", ex);
        }

        try {
            batchJobRunnerService.ensureRegisteredJobKey(jobKey.trim());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job class not found or not registered as Spring Batch Job", ex);
        }
    }

    private String validateAndNormalizeCron(String cronExpression) {
        String normalized = normalizeCronExpression(cronExpression);
        try {
            CronExpression.parse(normalized);
            return normalized;
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid cron expression", ex);
        }
    }

    private String normalizeCronExpression(String cronExpression) {
        String compact = cronExpression.trim().replaceAll("\\s+", " ");
        String[] parts = compact.split(" ");
        if (parts.length == 5) {
            return "0 " + compact;
        }
        if (parts.length == 6) {
            return compact;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cron expression must have 5 or 6 fields");
    }

    private Long extractBatchJobId(JobExecution execution) {
        JobParameter<?> parameter = execution.getJobParameters().getParameters().get("batchJobId");
        if (parameter == null || parameter.getValue() == null) {
            return null;
        }
        Object value = parameter.getValue();
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
