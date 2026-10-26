package com.sharebite.service;

import com.sharebite.dto.LoginRequest;
import com.sharebite.dto.RegisterRequest;
import com.sharebite.model.User;
import com.sharebite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    private final Map<String, String> tokenSessionMap = new HashMap<>();

    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest((password + "sharebite_salt").getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encoded) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public Map<String, Object> register(RegisterRequest req) {
        if (req.getName() == null || req.getEmail() == null || req.getPassword() == null || req.getRole() == null) {
            throw new IllegalArgumentException("Name, email, password, and role are required.");
        }

        String role = req.getRole().toLowerCase().trim();
        if (!Arrays.asList("donor", "ngo", "volunteer").contains(role)) {
            throw new IllegalArgumentException("Role must be donor, ngo, or volunteer.");
        }

        String email = req.getEmail().toLowerCase().trim();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        String userId = "usr_" + UUID.randomUUID().toString().substring(0, 8);
        String subtype = req.getSubtype() != null ? req.getSubtype() :
                (role.equals("donor") ? "Restaurant" : role.equals("ngo") ? "Food Bank" : "Eco Courier");

        String defaultAvatar = role.equals("donor")
                ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80"
                : role.equals("ngo")
                ? "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80"
                : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

        User user = new User(
                userId,
                req.getName().trim(),
                email,
                hashPassword(req.getPassword()),
                role,
                subtype,
                req.getPhone() != null ? req.getPhone() : "+1 (555) 123-4567",
                req.getAddress() != null ? req.getAddress() : "Metro Area",
                req.getCity(),
                defaultAvatar
        );

        userRepository.save(user);

        String token = "sb_tok_" + UUID.randomUUID().toString().replace("-", "");
        tokenSessionMap.put(token, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("user", user);
        return response;
    }

    public Map<String, Object> login(LoginRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        String email = req.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!user.getPasswordHash().equals(hashPassword(req.getPassword()))) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = "sb_tok_" + UUID.randomUUID().toString().replace("-", "");
        tokenSessionMap.put(token, user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("user", user);
        return response;
    }

    public List<User> getDemoUsers() {
        return userRepository.findAll();
    }

    public Map<String, Object> quickSwitch(String userId) {
        User user;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
        } else {
            user = userRepository.findAll().stream().findFirst().orElse(null);
        }

        if (user == null) {
            throw new IllegalArgumentException("Demo user not found");
        }

        String token = "sb_tok_" + UUID.randomUUID().toString().replace("-", "");
        tokenSessionMap.put(token, user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("user", user);
        return response;
    }

    public User getUserByToken(String token) {
        if (token == null) return null;
        if (token.startsWith("Bearer ")) token = token.substring(7).trim();
        String userId = tokenSessionMap.get(token);
        if (userId == null) return null;
        return userRepository.findById(userId).orElse(null);
    }
}
