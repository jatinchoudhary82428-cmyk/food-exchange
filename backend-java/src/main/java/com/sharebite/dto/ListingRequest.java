package com.sharebite.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ListingRequest {
    private String title;
    private String description;

    @JsonProperty("food_type")
    private String foodType;

    @JsonProperty("quantity_value")
    private double quantityValue;

    @JsonProperty("quantity_unit")
    private String quantityUnit = "servings";

    @JsonProperty("expiry_hours")
    private double expiryHours = 4.0;

    @JsonProperty("expiry_window_desc")
    private String expiryWindowDesc;

    @JsonProperty("pickup_address")
    private String pickupAddress;

    @JsonProperty("contact_phone")
    private String contactPhone;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("prep_time")
    private String prepTime;

    private String notes;

    public ListingRequest() {}

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

    public double getExpiryHours() { return expiryHours; }
    public void setExpiryHours(double expiryHours) { this.expiryHours = expiryHours; }

    public String getExpiryWindowDesc() { return expiryWindowDesc; }
    public void setExpiryWindowDesc(String expiryWindowDesc) { this.expiryWindowDesc = expiryWindowDesc; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getPrepTime() { return prepTime; }
    public void setPrepTime(String prepTime) { this.prepTime = prepTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
