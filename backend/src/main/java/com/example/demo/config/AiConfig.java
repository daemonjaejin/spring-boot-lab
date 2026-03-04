package com.example.demo.config;

import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Configuration
public class AiConfig {

    /**
     * Spring AI Ollama uses RestClient internally.
     * This customizer sets connection and read timeouts.
     */
    @Bean
    public RestClientCustomizer restClientCustomizer() {
        return restClientBuilder -> restClientBuilder
                .requestFactory(new SimpleClientHttpRequestFactory() {{
                    setConnectTimeout(10000); // 10 seconds
                    setReadTimeout(30000);    // 30 seconds
                }});
    }
}
