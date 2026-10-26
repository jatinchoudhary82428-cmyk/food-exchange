package com.sharebite.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "listings")
public class FoodListing {

    @Id
    private String id;

    @Column(name = "donor_id", nullable = false)
    private String donorId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "food_type", nullable = false)
    private String foodType; // "Veg", "Non-Veg", "Vegan", "Packaged"

    @Column(name = "quantity_value", nullable = false)
    private double quantityValue;

    @Column(name = "quantity_unit", nullable = false)
    private String quantityUnit; // "servings", "kg", "boxes", "meals"

    @Column(name = "servings_est", nullable = false)
    private int servingsEst;

    @Column(name = "weight_kg_est", nullable = false)
    private double weightKgEst;

    @Column(name = "prep_time", nullable = false)
    private String prepTime;

    @Column(name = "expiry_time", nullable = false)
    private String expiryTime;

    @Column(name = "expiry_window_desc", nullable = false)
    private String expiryWindowDesc;

    @Column(name = "pickup_address", nullable = false)
    private String pickupAddress;

    @Column(name = "contact_phone", nullable = false)
    private String contactPhone;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private String status = "Available"; // "Available", "Claimed", "In Transit", "Completed", "Cancelled"

    @Column(name = "claimed_by_id")
    private String claimedById;

    @Column(name = "claimed_by_name")
    private String claimedByName;

    @Column(name = "claimed_at")
    private String claimedAt;

    @Column(name = "volunteer_id")
    private String volunteerId;

    @Column(name = "volunteer_name")
    private String volunteerName;

    @Column(name = "completed_at")
    private String completedAt;

    @Column(name = "safety_check_confirmed")
    private int safetyCheckConfirmed = 1;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private String createdAt = LocalDateTime.now().toString();

    // Transient joined fields for JSON serialization
    @Transient
    private String donorName;

    @Transient
    private String donorSubtype;

    public FoodListing() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDonorId() { return donorId; }
    public void setDonorId(String donorId) { this.donorId = donorId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFoodType() { return foodType; }
    public void setFoodType(String foodType) { this.foodType = foodType; }

    public double getQuantityValue() { return quantityValue; }
    public void setQuantityValue(double quantityValue) { this.quantityValue = quantityValue; }

    public String getQuantityUnit() { return quantityUnit; }
    public void setQuantityUnit(String quantityUnit) { this.quantityUnit = quantityUnit; }

    public int getServingsEst() { return servingsEst; }
    public void setServingsEst(int servingsEst) { this.servingsEst = servingsEst; }

    public double getWeightKgEst() { return weightKgEst; }
    public void setWeightKgEst(double weightKgEst) { this.weightKgEst = weightKgEst; }

    public String getPrepTime() { return prepTime; }
    public void setPrepTime(String prepTime) { this.prepTime = prepTime; }

    public String getExpiryTime() { return expiryTime; }
    public void setExpiryTime(String expiryTime) { this.expiryTime = expiryTime; }

    public String getExpiryWindowDesc() { return expiryWindowDesc; }
    public void setExpiryWindowDesc(String expiryWindowDesc) { this.expiryWindowDesc = expiryWindowDesc; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getClaimedById() { return claimedById; }
    public void setClaimedById(String claimedById) { this.claimedById = claimedById; }

    public String getClaimedByName() { return claimedByName; }
    public void setClaimedByName(String claimedByName) { this.claimedByName = claimedByName; }

    public String getClaimedAt() { return claimedAt; }
    public void setClaimedAt(String claimedAt) { this.claimedAt = claimedAt; }

    public String getVolunteerId() { return volunteerId; }
    public void setVolunteerId(String volunteerId) { this.volunteerId = volunteerId; }

    public String getVolunteerName() { return volunteerName; }
    public void setVolunteerName(String volunteerName) { this.volunteerName = volunteerName; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public int getSafetyCheckConfirmed() { return safetyCheckConfirmed; }
    public void setSafetyCheckConfirmed(int safetyCheckConfirmed) { this.safetyCheckConfirmed = safetyCheckConfirmed; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorSubtype() { return donorSubtype; }
    public void setDonorSubtype(String donorSubtype) { this.donorSubtype = donorSubtype; }
}
