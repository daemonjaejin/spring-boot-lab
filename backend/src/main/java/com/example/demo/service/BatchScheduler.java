package com.example.demo.service;

import com.example.demo.entity.BatchJobDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * Registers enabled jobs with cron triggers.
 * 활성화된 Job을 cron 트리거로 등록하는 스케줄러 서비스.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BatchScheduler {
    private final BatchJobService batchJobService;
    private final TaskScheduler batchTaskScheduler;
    private final Map<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    /**
     * Refresh schedules when the app is ready.
     * 애플리케이션 기동 완료 시 스케줄을 재등록한다.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        refreshSchedules();
    }

    /**
     * Refresh schedules after CRUD events.
     * CRUD 이벤트 발생 후 스케줄을 재등록한다.
     */
    @EventListener(BatchJobsChangedEvent.class)
    public void onBatchJobsChanged() {
        refreshSchedules();
    }

    /**
     * Rebuilds scheduler registrations from DB state.
     * DB 상태를 기준으로 스케줄 등록을 다시 구성한다.
     */
    public synchronized void refreshSchedules() {
        scheduledTasks.values().forEach(task -> task.cancel(false));
        scheduledTasks.clear();

        List<BatchJobDefinition> enabledJobs = batchJobService.listEnabledJobs();
        for (BatchJobDefinition definition : enabledJobs) {
            try {
                CronTrigger trigger = new CronTrigger(definition.getCronExpression());
                ScheduledFuture<?> future = batchTaskScheduler.schedule(() -> runScheduled(definition.getId()), trigger);
                if (future != null) {
                    scheduledTasks.put(definition.getId(), future);
                }
            } catch (Exception ex) {
                log.error("Failed to register schedule for batch job id={}, cron={}", definition.getId(), definition.getCronExpression(), ex);
            }
        }
    }

    /**
     * Executes one scheduled batch job.
     * 예약 실행 대상 배치 Job을 1회 실행한다.
     */
    private void runScheduled(Long batchJobId) {
        try {
            batchJobService.runScheduled(batchJobId);
        } catch (Exception ex) {
            log.error("Scheduled run failed for batch job id={}", batchJobId, ex);
        }
    }
}

