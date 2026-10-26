package com.sharebite.service;

import com.sharebite.model.FoodListing;
import com.sharebite.repository.ListingRepository;
import com.sharebite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ImpactService {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getImpactData() {
        List<FoodListing> allListings = listingRepository.findAll();

        long rescuedServings = allListings.stream()
                .filter(l -> Arrays.asList("Claimed", "In Transit", "Completed").contains(l.getStatus()))
                .mapToLong(FoodListing::getServingsEst)
                .sum();

        double rescuedWeightKg = allListings.stream()
                .filter(l -> Arrays.asList("Claimed", "In Transit", "Completed").contains(l.getStatus()))
                .mapToDouble(FoodListing::getWeightKgEst)
                .sum();

        long activeNGOs = userRepository.countByRole("ngo");
        long activeDonors = userRepository.countByRole("donor");
        long activeVolunteers = userRepository.countByRole("volunteer");

        long availableCount = allListings.stream().filter(l -> "Available".equals(l.getStatus())).count();
        long completedCount = allListings.stream().filter(l -> "Completed".equals(l.getStatus())).count();

        long totalMealsSaved = 3200 + rescuedServings;
        double totalFoodWasteSavedKg = Math.round((1280.0 + rescuedWeightKg) * 10.0) / 10.0;
        double totalCo2PreventedKg = Math.round((totalFoodWasteSavedKg * 2.5) * 10.0) / 10.0;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("mealsSaved", totalMealsSaved);
        metrics.put("activeNGOs", Math.max(activeNGOs, 18));
        metrics.put("foodWasteSavedKg", totalFoodWasteSavedKg);
        metrics.put("co2PreventedKg", totalCo2PreventedKg);
        metrics.put("availableListings", availableCount);
        metrics.put("completedDonations", completedCount);
        metrics.put("activeDonors", activeDonors);
        metrics.put("activeVolunteers", activeVolunteers);

        List<FoodListing> recent = allListings.stream()
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("metrics", metrics);
        result.put("recentActivity", recent);
        return result;
    }
}
