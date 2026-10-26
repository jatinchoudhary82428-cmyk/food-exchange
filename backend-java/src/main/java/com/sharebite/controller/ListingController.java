package com.sharebite.controller;

import com.sharebite.dto.ListingRequest;
import com.sharebite.model.FoodListing;
import com.sharebite.model.User;
import com.sharebite.service.AuthService;
import com.sharebite.service.ListingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    @Autowired
    private ListingService listingService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<?> getListings(
            @RequestParam(required = false) String status,
            @RequestParam(name = "food_type", required = false) String foodType,
            @RequestParam(required = false) String urgency,
            @RequestParam(required = false) String search,
            @RequestParam(name = "donor_id", required = false) String donorId
    ) {
        List<FoodListing> list = listingService.getFilteredListings(status, foodType, urgency, search, donorId);
        Map<String, Object> res = new HashMap<>();
        res.put("listings", list);
        res.put("count", list.size());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getListing(@PathVariable String id) {
        try {
            FoodListing listing = listingService.getListingById(id);
            Map<String, Object> res = new HashMap<>();
            res.put("listing", listing);
            res.put("claim", null);
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
    }

    @PostMapping
    public ResponseEntity<?> createListing(
            @RequestBody ListingRequest request,
            @RequestHeader(value = "Authorization", required = false) String token
    ) {
        try {
            User user = authService.getUserByToken(token);
            String donorId = user != null ? user.getId() : "usr_donor_1";

            FoodListing listing = listingService.createListing(request, donorId);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("listing", listing);
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<?> claimListing(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        try {
            String ngoName = body != null ? body.get("ngoName") : "City Hope Food Bank";
            String eta = body != null ? body.get("eta") : "Within 45 minutes";
            FoodListing updated = listingService.claimListing(id, ngoName, eta);

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Successfully claimed by " + updated.getClaimedByName());
            res.put("listing", updated);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }
    }

    @PostMapping("/{id}/volunteer")
    public ResponseEntity<?> assignVolunteer(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        try {
            String volName = body != null ? body.get("volunteerName") : "Alex Rivera (Eco Courier)";
            FoodListing updated = listingService.assignVolunteer(id, volName);

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", volName + " assigned for delivery!");
            res.put("listing", updated);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        try {
            String status = body.get("status");
            String notes = body.get("completionNotes");
            FoodListing updated = listingService.updateStatus(id, status, notes);

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("status", status);
            res.put("listing", updated);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable String id) {
        listingService.deleteListing(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Listing removed.");
        return ResponseEntity.ok(res);
    }
}
