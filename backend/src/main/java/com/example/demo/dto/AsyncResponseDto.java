package com.example.demo.dto;

public class AsyncResponseDto {
    private String threadName;
    private long timestamp;
    private String message;

    public AsyncResponseDto(String threadName, long timestamp, String message) {
        this.threadName = threadName;
        this.timestamp = timestamp;
        this.message = message;
    }

    public String getThreadName() {
        return threadName;
    }

    public void setThreadName(String threadName) {
        this.threadName = threadName;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
