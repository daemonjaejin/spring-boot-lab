package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.batch.BatchExecutionResponse;
import com.example.demo.dto.batch.BatchJobRequest;
import com.example.demo.dto.batch.BatchJobResponse;
import com.example.demo.dto.batch.BatchRunResponse;
import com.example.demo.service.BatchJobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/batch")
@RequiredArgsConstructor
public class BatchController {
    private final BatchJobService batchJobService;

    /**
     * Returns all batch job definitions.
     * 배치 작업 정의 목록을 조회한다.
     */
    @GetMapping("/jobs")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<ApiResponse<List<BatchJobResponse>>> listJobs() {
        try {
            return ResponseEntity.ok(ApiResponse.success("Job list fetched successfully", batchJobService.listJobs()));
        } catch (Exception ex) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, messageOf(ex));
        }
    }

    /**
     * Creates a new batch job definition.
     * 새로운 배치 작업 정의를 생성한다.
     */
    @PostMapping("/jobs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BatchJobResponse>> createJob(@Valid @RequestBody BatchJobRequest request) {
        try {
            BatchJobResponse created = batchJobService.createJob(request);
            return ResponseEntity.ok(ApiResponse.success("Job created successfully", created));
        } catch (ResponseStatusException ex) {
            return error(ex.getStatusCode().value(), ex.getReason());
        } catch (Exception ex) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, messageOf(ex));
        }
    }

    /**
     * Returns one batch job definition by id.
     * id 기준으로 단일 배치 작업 정의를 조회한다.
     */
    @GetMapping("/jobs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<ApiResponse<BatchJobResponse>> getJob(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Job fetched successfully", batchJobService.getJob(id)));
        } catch (ResponseStatusException ex) {
            return error(ex.getStatusCode().value(), ex.getReason());
        } catch (Exception ex) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, messageOf(ex));
        }
    }

    /**
     * Updates one batch job definition.
     * 단일 배치 작업 정의를 수정한다.
     */
    @PutMapping("/jobs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BatchJobResponse>> updateJob(@PathVariable Long id, @Valid @RequestBody BatchJobRequest request) {
        try {
            BatchJobResponse updated = batchJobService.updateJob(id, request);
            return ResponseEntity.ok(ApiResponse.success("Job updated successfully", updated));
        } catch (ResponseStatusException ex) {
            return error(ex.getStatusCode().value(), ex.getReason());
        } catch (Exception ex) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, messageOf(ex));
        }
    }

    /**
     * Deletes one batch job definition.
     * 단일 배치 작업 정의를 삭제한다.
     */
    @DeleteMapping("/jobs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        try {
            batchJobService.deleteJob(id);
            return ResponseEntity.ok(ApiResponse.success("Job deleted successfully"));
        } catch (ResponseStatusException ex) {
            return error(ex.getStatusCode().value(), ex.getReason());
        } catch (Exception ex) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, messageOf(ex));
        }
    }

    /**
     * Executes one batch job immediately.
     * 단일 배치 작업을 즉시 실행한다.
     */
    @PostMapping("/jobs/{id}/run")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BatchRunResponse>> runJob(@PathVariable Long id) {
        try {
            BatchRunResponse runResponse = batchJobService.runNow(id);
            return ResponseEntity.ok(ApiResponse.success("Job executed successfully", runResponse));
        } catch (ResponseStatusException ex) {
            return error(ex.getStatusCode().value(), ex.getReason());
        } catch (Exception ex) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, messageOf(ex));
        }
    }

    /**
     * Returns batch execution history.
     * 배치 실행 이력을 조회한다.
     */
    @GetMapping("/executions")
    @PreAuthorize("hasAnyRole('ADMIN','MEMBER')")
    public ResponseEntity<ApiResponse<List<BatchExecutionResponse>>> listExecutions() {
        try {
            return ResponseEntity.ok(ApiResponse.success("Execution list fetched successfully", batchJobService.listExecutions()));
        } catch (Exception ex) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, messageOf(ex));
        }
    }

    private String messageOf(Throwable ex) {
        if (ex.getMessage() != null && !ex.getMessage().isBlank()) {
            return ex.getMessage();
        }
        if (ex.getCause() != null && ex.getCause().getMessage() != null && !ex.getCause().getMessage().isBlank()) {
            return ex.getCause().getMessage();
        }
        return "Unexpected batch API error";
    }

    private <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiResponse<>(false, message, null));
    }

    private <T> ResponseEntity<ApiResponse<T>> error(int statusCode, String message) {
        HttpStatus status = HttpStatus.resolve(statusCode);
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return error(status, message);
    }
}

