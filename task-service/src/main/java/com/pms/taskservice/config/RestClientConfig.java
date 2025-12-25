package com.pms.taskservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestClientConfig {

    @Value("${application.config.rest.connect-timeout-ms:2000}")
    private int connectTimeoutMs;

    @Value("${application.config.rest.read-timeout-ms:4000}")
    private int readTimeoutMs;

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeoutMs);
        requestFactory.setReadTimeout(readTimeoutMs);
        return new RestTemplate(requestFactory);
    }
}
