package com.example.demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private final OllamaChatModel chatModel;

    public String generateResponse(String userMessageContent) {
        String systemText = "너는 친절한 한국어 AI 비서야. 모든 답변은 반드시 한국어로만 작성해줘.";
        
        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemText);
        var systemMessage = systemPromptTemplate.createMessage();
        
        UserMessage userMessage = new UserMessage(userMessageContent);
        
        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
        
        ChatResponse response = chatModel.call(prompt);
        return response.getResult().getOutput().getContent();
    }
}
