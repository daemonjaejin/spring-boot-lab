package com.example.demo.service;

import com.example.demo.dto.AsyncResponseDto;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class AsyncService {

    @Async("taskExecutor")
    public CompletableFuture<AsyncResponseDto> processAsync() {
        try {
            Thread.sleep(2000); // 2초 대기
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String threadName = Thread.currentThread().getName();
        long timestamp = System.currentTimeMillis();
        String message = "비동기 처리 완료";

        return CompletableFuture.completedFuture(
                new AsyncResponseDto(threadName, timestamp, message)
        );
    }
}
