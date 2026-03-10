package com.example.demo.controller;

import com.example.demo.service.AiChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Chat", description = "Ollama LLM Integration API")
public class AiChatController {

    private final AiChatService aiChatService;

    @GetMapping(value = "/chat", produces = "application/json; charset=UTF-8")
    @Operation(summary = "Chat with Ollama", description = "Sends a prompt to the Ollama LLM and returns the response.")
    public Map<String, String> chat(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message) {
        log.info("AI Request received: prompt='{}'", message);
        
        try {
            String response = aiChatService.generateResponse(message);
            log.info("AI Response received successfully.");
            return Map.of("answer", response);
        } catch (Exception e) {
            log.error("AI Chat failed. Ollama might be slow or unresponsive. Error: {}", e.getMessage());
            throw e;
        }
    }
}
