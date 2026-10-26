package com.sharebite.service;

import com.sharebite.dto.ListingRequest;
import com.sharebite.model.Claim;
import com.sharebite.model.FoodListing;
import com.sharebite.model.User;
import com.sharebite.repository.ClaimRepository;
import com.sharebite.repository.ListingRepository;
import com.sharebite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ListingService {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClaimRepository claimRepository;

    public List<FoodListing> getFilteredListings(String status, String foodType, String urgency, String search, String donorId) {
        List<FoodListing> all = listingRepository.findAllOrdered();

        // Join donor details
        Map<String, User> userCache = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        for (FoodListing l : all) {
            User donor = userCache.get(l.getDonorId());
            if (donor != null) {
                l.setDonorName(donor.getName());
                l.setDonorSubtype(donor.getSubtype());
            }
        }

        return all.stream().filter(l -> {
            if (status != null && !status.equalsIgnoreCase("all") && !l.getStatus().equalsIgnoreCase(status)) {
                return false;
            }
            if (foodType != null && !foodType.equalsIgnoreCase("all") && !l.getFoodType().equalsIgnoreCase(foodType)) {
                return false;
            }
            if (donorId != null && !l.getDonorId().equals(donorId)) {
                return false;
            }
            if (search != null && !search.trim().isEmpty()) {
                String q = search.toLowerCase().trim();
                boolean matchesTitle = l.getTitle().toLowerCase().contains(q);
                boolean matchesDesc = l.getDescription() != null && l.getDescription().toLowerCase().contains(q);
                boolean matchesDonor = l.getDonorName() != null && l.getDonorName().toLowerCase().contains(q);
                if (!matchesTitle && !matchesDesc && !matchesDonor) return false;
            }
            if ("urgent".equalsIgnoreCase(urgency)) {
                try {
                    Instant exp = Instant.parse(l.getExpiryTime());
                    Instant twoHours = Instant.now().plus(2, ChronoUnit.HOURS);
                    if (exp.isAfter(twoHours) || !l.getStatus().equals("Available")) return false;
                } catch (Exception ignored) {}
            }
            return true;
        }).collect(Collectors.toList());
    }

    public FoodListing getListingById(String id) {
        FoodListing l = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        userRepository.findById(l.getDonorId()).ifPresent(u -> {
            l.setDonorName(u.getName());
            l.setDonorSubtype(u.getSubtype());
        });
        return l;
    }

    public FoodListing createListing(ListingRequest req, String donorId) {
        if (req.getTitle() == null || req.getFoodType() == null || req.getQuantityValue() <= 0) {
            throw new IllegalArgumentException("Title, food type, and quantity are required.");
        }

        String finalDonorId = donorId != null ? donorId : "usr_donor_1";
        User donor = userRepository.findById(finalDonorId).orElse(null);

        double qVal = req.getQuantityValue();
        String qUnit = req.getQuantityUnit() != null ? req.getQuantityUnit() : "servings";
        int servings;
        double weightKg;

        if (qUnit.equalsIgnoreCase("servings") || qUnit.equalsIgnoreCase("meals")) {
            servings = (int) Math.round(qVal);
            weightKg = Math.round(servings * 0.4 * 10.0) / 10.0;
        } else if (qUnit.equalsIgnoreCase("kg")) {
            weightKg = Math.round(qVal * 10.0) / 10.0;
            servings = (int) Math.max(1, Math.round(weightKg / 0.4));
        } else {
            servings = (int) Math.round(qVal * 3);
            weightKg = Math.round(servings * 0.4 * 10.0) / 10.0;
        }

        double expHours = req.getExpiryHours() > 0 ? req.getExpiryHours() : 4.0;
        Instant expiryInstant = Instant.now().plus((long) (expHours * 3600), ChronoUnit.SECONDS);

        FoodListing listing = new FoodListing();
        listing.setId("lst_" + UUID.randomUUID().toString().substring(0, 8));
        listing.setDonorId(finalDonorId);
        listing.setTitle(req.getTitle().trim());
        listing.setDescription(req.getDescription() != null ? req.getDescription().trim() : "Fresh surplus food.");
        listing.setFoodType(req.getFoodType());
        listing.setQuantityValue(qVal);
        listing.setQuantityUnit(qUnit);
        listing.setServingsEst(servings);
        listing.setWeightKgEst(weightKg);
        listing.setPrepTime(req.getPrepTime() != null ? req.getPrepTime() : "Just now");
        listing.setExpiryTime(expiryInstant.toString());
        listing.setExpiryWindowDesc(req.getExpiryWindowDesc() != null ? req.getExpiryWindowDesc() : "Best before " + (int) expHours + " hours");
        listing.setPickupAddress(req.getPickupAddress() != null ? req.getPickupAddress() : (donor != null ? donor.getAddress() : "Metro Area"));
        listing.setContactPhone(req.getContactPhone() != null ? req.getContactPhone() : (donor != null ? donor.getPhone() : "+1 (555) 123-4567"));
        listing.setImageUrl(req.getImageUrl() != null ? req.getImageUrl() : "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80");
        listing.setStatus("Available");
        listing.setNotes(req.getNotes());

        return listingRepository.save(listing);
    }

    public FoodListing claimListing(String id, String ngoName, String eta) {
        FoodListing l = getListingById(id);
        if (!l.getStatus().equals("Available")) {
            throw new IllegalStateException("Listing is already " + l.getStatus());
        }

        String claimerName = ngoName != null ? ngoName : "City Hope Food Bank";
        l.setStatus("Claimed");
        l.setClaimedByName(claimerName);
        l.setClaimedAt(Instant.now().toString());
        listingRepository.save(l);

        Claim claim = new Claim();
        claim.setId("clm_" + UUID.randomUUID().toString().substring(0, 8));
        claim.setListingId(id);
        claim.setNgoId("usr_ngo_1");
        claim.setStatus("Claimed");
        claim.setPickupEta(eta != null ? eta : "Within 45 minutes");
        claim.setBeneficiaryCount(l.getServingsEst());
        claimRepository.save(claim);

        return l;
    }

    public FoodListing assignVolunteer(String id, String volunteerName) {
        FoodListing l = getListingById(id);
        String courier = volunteerName != null ? volunteerName : "Alex Rivera (Eco Courier)";
        l.setStatus("In Transit");
        l.setVolunteerName(courier);
        listingRepository.save(l);

        List<Claim> claims = claimRepository.findByListingId(id);
        if (!claims.isEmpty()) {
            Claim c = claims.get(0);
            c.setStatus("In Transit");
            claimRepository.save(c);
        }

        return l;
    }

    public FoodListing updateStatus(String id, String newStatus, String notes) {
        FoodListing l = getListingById(id);
        l.setStatus(newStatus);
        if ("Completed".equalsIgnoreCase(newStatus)) {
            l.setCompletedAt(Instant.now().toString());
            List<Claim> claims = claimRepository.findByListingId(id);
            if (!claims.isEmpty()) {
                Claim c = claims.get(0);
                c.setStatus("Completed");
                claimRepository.save(c);
            }
        }
        if (notes != null) l.setNotes(notes);
        return listingRepository.save(l);
    }

    public void deleteListing(String id) {
        listingRepository.deleteById(id);
    }
}
