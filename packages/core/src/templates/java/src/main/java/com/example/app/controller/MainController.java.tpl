package com.example.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

/**
 * Main controller for {{projectName}}
 */
@RestController
public class MainController {

    @GetMapping("/")
    public Map<String, Object> welcome() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to {{projectName}}!");
        response.put("status", "running");
        response.put("version", "1.0.0");
        return response;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "{{projectName}}");
        response.put("version", "1.0.0");
        return response;
    }
}
