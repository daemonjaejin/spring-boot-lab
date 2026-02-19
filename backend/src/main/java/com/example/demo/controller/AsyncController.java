package com.example.demo.controller;

import com.example.demo.dto.AsyncResponseDto;
import com.example.demo.service.AsyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/async")
@CrossOrigin(origins = "http://localhost:3000")
public class AsyncController {

    private final AsyncService asyncService;

    @Autowired
    public AsyncController(AsyncService asyncService) {
        this.asyncService = asyncService;
    }

    @GetMapping("/test")
    public AsyncResponseDto testAsync() throws ExecutionException, InterruptedException {
        CompletableFuture<AsyncResponseDto> future = asyncService.processAsync();
        return future.get(); // Wait for result (for simplicity in this specific test requirement, or return Future directly)
    }
}
