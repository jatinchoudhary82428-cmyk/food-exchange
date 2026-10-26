package com.sharebite.controller;

import com.sharebite.dto.LoginRequest;
import com.sharebite.dto.RegisterRequest;
import com.sharebite.model.User;
import com.sharebite.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            Map<String, Object> res = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(e.getMessage().contains("already exists") ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST).body(err);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Map<String, Object> res = authService.login(request);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }
    }

    @GetMapping("/demo-users")
    public ResponseEntity<?> getDemoUsers() {
        Map<String, Object> res = new HashMap<>();
        res.put("users", authService.getDemoUsers());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/quick-switch")
    public ResponseEntity<?> quickSwitch(@RequestBody(required = false) Map<String, String> body) {
        String userId = (body != null) ? body.get("userId") : null;
        try {
            Map<String, Object> res = authService.quickSwitch(userId);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader(value = "Authorization", required = false) String token) {
        User user = authService.getUserByToken(token);
        if (user == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }
        Map<String, Object> res = new HashMap<>();
        res.put("user", user);
        return ResponseEntity.ok(res);
    }
}
