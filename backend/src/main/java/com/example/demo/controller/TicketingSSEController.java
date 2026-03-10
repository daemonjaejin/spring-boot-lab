package com.example.demo.controller;

import com.example.demo.service.QueueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/ticketing")
@RequiredArgsConstructor
public class TicketingSSEController {
    private final QueueService queueService;
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @GetMapping(value = "/subscribe/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable String userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));

        // Initial Rank
        sendRank(userId, emitter);

        return emitter;
    }

    @PostMapping("/enter")
    public Long enter(@RequestBody Map<String, String> payload) {
        return queueService.addQueue(payload.get("userId"));
    }

    private void sendRank(String userId, SseEmitter emitter) {
        try {
            Long rank = queueService.getRank(userId);
            boolean isProcessing = queueService.isProcessing(userId);
            
            Map<String, Object> data = Map.of(
                "rank", rank == null ? -1 : rank,
                "isProcessing", isProcessing,
                "totalWaiting", queueService.getQueueSize()
            );
            
            emitter.send(SseEmitter.event()
                    .name("queueStatus")
                    .data(data));
            
            if (isProcessing) {
                emitter.complete();
                emitters.remove(userId);
            }
        } catch (IOException e) {
            emitters.remove(userId);
        }
    }

    // Background task to update rankings and send heartbeats
    @jakarta.annotation.PostConstruct
    public void startRankUpdateTask() {
        scheduler.scheduleAtFixedRate(() -> {
            emitters.forEach((userId, emitter) -> {
                try {
                    Long rank = queueService.getRank(userId);
                    boolean isProcessing = queueService.isProcessing(userId);
                    
                    Map<String, Object> data = Map.of(
                        "rank", rank == null ? -1 : rank,
                        "isProcessing", isProcessing,
                        "totalWaiting", queueService.getQueueSize(),
                        "timestamp", System.currentTimeMillis() // Heartbeat
                    );
                    
                    emitter.send(SseEmitter.event()
                            .name("queueStatus")
                            .data(data));
                    
                    if (isProcessing) {
                        emitter.complete();
                        emitters.remove(userId);
                    }
                } catch (IOException e) {
                    emitters.remove(userId);
                }
            });
            
            // Periodically process users from queue
            queueService.getTopAndProcess(10);
            
        }, 5, 5, TimeUnit.SECONDS); // Heartbeat every 5 seconds
    }
}
