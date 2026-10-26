package com.sharebite.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    private String id;

    @Column(name = "listing_id", nullable = false)
    private String listingId;

    @Column(name = "ngo_id", nullable = false)
    private String ngoId;

    @Column(name = "volunteer_id")
    private String volunteerId;

    @Column(nullable = false)
    private String status = "Claimed"; // "Claimed", "In Transit", "Completed", "Cancelled"

    @Column(name = "beneficiary_count")
    private int beneficiaryCount;

    @Column(name = "pickup_eta")
    private String pickupEta;

    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Claim() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getListingId() { return listingId; }
    public void setListingId(String listingId) { this.listingId = listingId; }

    public String getNgoId() { return ngoId; }
    public void setNgoId(String ngoId) { this.ngoId = ngoId; }

    public String getVolunteerId() { return volunteerId; }
    public void setVolunteerId(String volunteerId) { this.volunteerId = volunteerId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getBeneficiaryCount() { return beneficiaryCount; }
    public void setBeneficiaryCount(int beneficiaryCount) { this.beneficiaryCount = beneficiaryCount; }

    public String getPickupEta() { return pickupEta; }
    public void setPickupEta(String pickupEta) { this.pickupEta = pickupEta; }

    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
