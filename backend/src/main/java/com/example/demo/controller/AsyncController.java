package com.example.demo.controller;

import com.example.demo.annotation.LogExecutionTime;
import com.example.demo.dto.AsyncResponseDto;
import com.example.demo.service.AsyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;


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
    @LogExecutionTime
    public CompletableFuture<AsyncResponseDto> testAsync() {
        return asyncService.processAsync();
    }
}
