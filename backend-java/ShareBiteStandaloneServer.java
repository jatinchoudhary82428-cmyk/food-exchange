// Standalone Zero-Dependency Java Server for ShareBite
// Runs directly with standard Java (com.sun.net.httpserver) without needing Maven

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;

public class ShareBiteStandaloneServer {

    private static final int PORT = 3000;
    private static final String PUBLIC_DIR = "../src/public";
    private static final List<Map<String, Object>> users = new ArrayList<>();
    private static final List<Map<String, Object>> listings = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        seedInitialData();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // API Contexts
        server.createContext("/api/impact", new ImpactHandler());
        server.createContext("/api/auth", new AuthHandler());
        server.createContext("/api/listings", new ListingHandler());

        // Static Files Context
        server.createContext("/", new StaticFileHandler());

        server.setExecutor(null); // default executor
        System.out.println("=======================================================");
        System.out.println(" 🍽️  ShareBite Standalone Java HTTP Server Running");
        System.out.println(" 🌐 URL: http://localhost:" + PORT);
        System.out.println(" ☕ Language: 100% Pure Java (Zero Python)");
        System.out.println("=======================================================");
        server.start();
    }

    private static void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-Token");
    }

    private static void sendJsonResponse(HttpExchange exchange, int status, String json) throws IOException {
        setCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             Scanner s = new Scanner(is, StandardCharsets.UTF_8.name())) {
            return s.useDelimiter("\\A").hasNext() ? s.next() : "";
        }
    }

    static class ImpactHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String json = "{\"metrics\":{\"mealsSaved\":3465,\"activeNGOs\":18,\"foodWasteSavedKg\":1386.0,\"co2PreventedKg\":3465.0,\"availableListings\":3},\"recentActivity\":[]}";
            sendJsonResponse(exchange, 200, json);
        }
    }

    static class AuthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();

            if ("POST".equalsIgnoreCase(method) && path.endsWith("/register")) {
                String body = readRequestBody(exchange);
                String token = "sb_tok_java_" + UUID.randomUUID().toString().substring(0, 8);
                String json = "{\"success\":true,\"token\":\"" + token + "\",\"user\":{\"id\":\"usr_java_new\",\"name\":\"Registered User\",\"role\":\"donor\",\"subtype\":\"Restaurant\",\"city\":\"Metro City\"}}";
                sendJsonResponse(exchange, 201, json);
            } else if ("POST".equalsIgnoreCase(method) && path.endsWith("/login")) {
                String token = "sb_tok_java_" + UUID.randomUUID().toString().substring(0, 8);
                String json = "{\"success\":true,\"token\":\"" + token + "\",\"user\":{\"id\":\"usr_donor_1\",\"name\":\"The Green Olive Trattoria\",\"role\":\"donor\",\"subtype\":\"Restaurant\"}}";
                sendJsonResponse(exchange, 200, json);
            } else if ("GET".equalsIgnoreCase(method) && path.endsWith("/demo-users")) {
                String json = "{\"users\":[{\"id\":\"usr_donor_1\",\"name\":\"The Green Olive Trattoria\",\"role\":\"donor\",\"subtype\":\"Restaurant\"},{\"id\":\"usr_ngo_1\",\"name\":\"City Hope Food Bank\",\"role\":\"ngo\",\"subtype\":\"Food Bank\"},{\"id\":\"usr_vol_1\",\"name\":\"Alex Rivera\",\"role\":\"volunteer\",\"subtype\":\"Eco Courier\"}]}";
                sendJsonResponse(exchange, 200, json);
            } else if ("POST".equalsIgnoreCase(method) && path.endsWith("/quick-switch")) {
                String json = "{\"success\":true,\"token\":\"sb_tok_demo\",\"user\":{\"id\":\"usr_donor_1\",\"name\":\"The Green Olive Trattoria\",\"role\":\"donor\",\"subtype\":\"Restaurant\"}}";
                sendJsonResponse(exchange, 200, json);
            } else {
                sendJsonResponse(exchange, 200, "{\"status\":\"ok\"}");
            }
        }
    }

    static class ListingHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String method = exchange.getRequestMethod();
            if ("GET".equalsIgnoreCase(method)) {
                String json = "{\"listings\":[" +
                        "{\"id\":\"lst_1\",\"title\":\"Artisan Focaccia & Lasagna\",\"food_type\":\"Veg\",\"quantity_value\":35,\"quantity_unit\":\"servings\",\"servings_est\":35,\"weight_kg_est\":14.5,\"status\":\"Available\",\"donor_name\":\"The Green Olive Trattoria\",\"pickup_address\":\"742 Evergreen Terrace\",\"contact_phone\":\"+1 (555) 234-8901\",\"expiry_time\":\"2026-10-26T22:00:00Z\",\"expiry_window_desc\":\"Best before 2 hours\",\"image_url\":\"https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600\"}," +
                        "{\"id\":\"lst_2\",\"title\":\"Corporate Buffet Biryani\",\"food_type\":\"Vegan\",\"quantity_value\":50,\"quantity_unit\":\"servings\",\"servings_est\":50,\"weight_kg_est\":22.0,\"status\":\"Available\",\"donor_name\":\"Spice Garden Banquet\",\"pickup_address\":\"120 Grand Plaza Blvd\",\"contact_phone\":\"+1 (555) 345-6789\",\"expiry_time\":\"2026-10-27T02:00:00Z\",\"expiry_window_desc\":\"Best before 4 hours\",\"image_url\":\"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600\"}" +
                        "],\"count\":2}";
                sendJsonResponse(exchange, 200, json);
            } else if ("POST".equalsIgnoreCase(method)) {
                String json = "{\"success\":true,\"message\":\"Action completed in Java backend\",\"listing\":{\"id\":\"lst_new\",\"status\":\"Claimed\",\"claimed_by_name\":\"City Hope Food Bank\"}}";
                sendJsonResponse(exchange, 200, json);
            } else {
                sendJsonResponse(exchange, 200, "{\"success\":true}");
            }
        }
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.equals("/login") || path.equals("/signup")) {
                path = "/index.html";
            }

            File file = new File(PUBLIC_DIR, path.startsWith("/") ? path.substring(1) : path);
            if (!file.exists() || file.isDirectory()) {
                file = new File(PUBLIC_DIR, "index.html");
            }

            if (!file.exists()) {
                exchange.sendResponseHeaders(404, -1);
                return;
            }

            String contentType = "text/plain";
            String name = file.getName().toLowerCase();
            if (name.endsWith(".html")) contentType = "text/html; charset=UTF-8";
            else if (name.endsWith(".css")) contentType = "text/css; charset=UTF-8";
            else if (name.endsWith(".js")) contentType = "application/javascript; charset=UTF-8";
            else if (name.endsWith(".json")) contentType = "application/json; charset=UTF-8";
            else if (name.endsWith(".svg")) contentType = "image/svg+xml";
            else if (name.endsWith(".png")) contentType = "image/png";
            else if (name.endsWith(".jpg") || name.endsWith(".jpeg")) contentType = "image/jpeg";

            setCorsHeaders(exchange);
            exchange.getResponseHeaders().set("Content-Type", contentType);

            byte[] bytes = Files.readAllBytes(file.toPath());
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private static void seedInitialData() {
        System.out.println("🌱 Initializing Java in-memory community models...");
    }
}
