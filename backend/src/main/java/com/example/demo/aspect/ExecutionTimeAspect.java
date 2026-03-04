package com.example.demo.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class ExecutionTimeAspect {

    @Around("execution(public * com.example.demo.controller..*(..)) || @annotation(com.example.demo.annotation.LogExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        Object proceed = joinPoint.proceed();

        long executionTime = System.currentTimeMillis() - start;

        // Custom format as requested: [AOP] Method: {methodName} | Execution Time: {time}ms
        log.info("[AOP] Method: {} | Execution Time: {}ms", joinPoint.getSignature().toShortString(), executionTime);

        return proceed;
    }
}
