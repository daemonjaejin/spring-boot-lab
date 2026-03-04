package com.example.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Chat", description = "Ollama LLM Integration API")
public class AiChatController {

    private final OllamaChatModel chatModel;

    @GetMapping(value = "/chat", produces = "application/json; charset=UTF-8")
    @Operation(summary = "Chat with Ollama", description = "Sends a prompt to the Ollama LLM and returns the response.")
    public Map<String, String> chat(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message) {
        log.info("AI Request received: prompt='{}'", message);
        
        try {
            log.info("Calling Ollama LLM with system prompt...");
            
            String systemText = "너는 친절한 한국어 AI 비서야. 모든 답변은 반드시 한국어로만 작성해줘.";
            Message systemMessage = new SystemMessage(systemText);
            Message userMessage = new UserMessage(message);
            
            Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
            
            ChatResponse chatResponse = chatModel.call(prompt);
            String response = chatResponse.getResult().getOutput().getContent();
            
            log.info("AI Response received successfully.");
            return Map.of("answer", response);
        } catch (Exception e) {
            log.error("AI Chat failed. Ollama might be slow or unresponsive. Error: {}", e.getMessage());
            throw e;
        }
    }
}
