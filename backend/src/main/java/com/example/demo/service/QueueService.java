package com.example.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class QueueService {
    @Lazy
    private final RedisTemplate<String, String> redisTemplate;
    private static final String QUEUE_KEY = "ticketing_queue";
    private static final String PROCESSING_KEY = "ticketing_processing";

    public Long addQueue(String userId) {
        long now = System.currentTimeMillis();
        redisTemplate.opsForZSet().add(QUEUE_KEY, userId, now);
        log.info("User {} added to queue at {}", userId, now);
        return getRank(userId);
    }

    public Long getRank(String userId) {
        return redisTemplate.opsForZSet().rank(QUEUE_KEY, userId);
    }

    public void removeQueue(String userId) {
        redisTemplate.opsForZSet().remove(QUEUE_KEY, userId);
    }

    public Set<String> getTopAndProcess(int count) {
        Set<String> users = redisTemplate.opsForZSet().range(QUEUE_KEY, 0, count - 1);
        if (users != null && !users.isEmpty()) {
            for (String user : users) {
                redisTemplate.opsForZSet().remove(QUEUE_KEY, user);
                redisTemplate.opsForSet().add(PROCESSING_KEY, user);
            }
        }
        return users;
    }

    public boolean isProcessing(String userId) {
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(PROCESSING_KEY, userId));
    }

    public Long getQueueSize() {
        return redisTemplate.opsForZSet().size(QUEUE_KEY);
    }

    // Scheduled cleanup for users who haven't performed activity for 5 minutes
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    public void cleanupInactiveUsers() {
        long threshold = System.currentTimeMillis() - (5 * 60 * 1000);
        Long removed = redisTemplate.opsForZSet().removeRangeByScore(QUEUE_KEY, 0, threshold);
        if (removed != null && removed > 0) {
            log.info("Cleaned up {} inactive users from queue", removed);
        }
    }
}
