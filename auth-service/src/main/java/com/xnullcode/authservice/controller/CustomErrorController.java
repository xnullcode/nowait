package com.xnullcode.authservice.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

        Map<String, Object> errorDetails = new HashMap<>();
        
        int statusCode = HttpStatus.INTERNAL_SERVER_ERROR.value();
        if (status != null) {
            statusCode = Integer.parseInt(status.toString());
        }

        errorDetails.put("status", statusCode);
        errorDetails.put("error", HttpStatus.valueOf(statusCode).getReasonPhrase());
        errorDetails.put("message", message != null && !message.toString().isEmpty() ? message : "An unexpected error occurred or access was denied");
        errorDetails.put("path", path);

        return ResponseEntity.status(statusCode).body(errorDetails);
    }
}
