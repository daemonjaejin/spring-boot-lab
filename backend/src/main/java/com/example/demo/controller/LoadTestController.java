package com.example.demo.controller;

import com.example.demo.service.QueueService;
import com.example.demo.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@RestController
@RequestMapping("/api/ticketing/test")
@RequiredArgsConstructor
public class LoadTestController {
    private final QueueService queueService;
    private final ReservationService reservationService;

    @PostMapping("/simulate")
    public Map<String, Object> simulate(@RequestBody Map<String, Integer> payload) {
        int count = payload.getOrDefault("count", 10);
        long startTime = System.currentTimeMillis();
        
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        log.info("[LOAD_TEST] Starting simulation for {} users", count);

        for (int i = 0; i < count; i++) {
            String testUserId = "test_user_" + i;
            futures.add(CompletableFuture.runAsync(() -> {
                try {
                    // 1. Enter Queue
                    queueService.addQueue(testUserId);
                    
                    // 2. Wait for processing (simulated)
                    while (!queueService.isProcessing(testUserId)) {
                        Thread.sleep(100);
                    }

                    // 3. Reserve Seat (Assume seat ID 1 for test, should exist in DB)
                    reservationService.reserveSeat(1L, testUserId);
                    successCount.incrementAndGet();
                    log.info("[LOAD_TEST] Success: User {} reserved seat", testUserId);
                } catch (Exception e) {
                    failCount.incrementAndGet();
                    log.error("[LOAD_TEST] Failure: User {} failed - {}", testUserId, e.getMessage());
                }
            }));
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        return Map.of(
            "total", count,
            "success", successCount.get(),
            "failure", failCount.get(),
            "durationMs", duration,
            "avgMs", count > 0 ? duration / count : 0
        );
    }
}
