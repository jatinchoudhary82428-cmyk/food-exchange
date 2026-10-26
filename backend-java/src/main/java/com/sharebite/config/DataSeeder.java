package com.sharebite.config;

import com.sharebite.model.FoodListing;
import com.sharebite.model.User;
import com.sharebite.repository.ListingRepository;
import com.sharebite.repository.UserRepository;
import com.sharebite.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        System.out.println("🌱 [Java Spring Boot] Seeding ShareBite database with demo data...");

        User donor1 = new User(
                "usr_donor_1",
                "The Green Olive Trattoria",
                "donor@greenolive.com",
                AuthService.hashPassword("password123"),
                "donor",
                "Restaurant",
                "+1 (555) 234-8901",
                "742 Evergreen Terrace, Downtown",
                "Metro City",
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80"
        );

        User donor2 = new User(
                "usr_donor_2",
                "Spice Garden Banquet & Caterers",
                "events@spicegarden.com",
                AuthService.hashPassword("password123"),
                "donor",
                "Caterer",
                "+1 (555) 345-6789",
                "120 Grand Plaza Boulevard",
                "Metro City",
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80"
        );

        User ngo1 = new User(
                "usr_ngo_1",
                "City Hope Food Bank",
                "ngo@cityhope.org",
                AuthService.hashPassword("password123"),
                "ngo",
                "Food Bank",
                "+1 (555) 987-6543",
                "404 Community Relief Ave",
                "Metro City",
                "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80"
        );

        User vol1 = new User(
                "usr_vol_1",
                "Alex Rivera",
                "volunteer@sharebite.org",
                AuthService.hashPassword("password123"),
                "volunteer",
                "Eco Courier / Driver",
                "+1 (555) 765-4321",
                "22 Elm Street, Uptown",
                "Metro City",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        );

        userRepository.save(donor1);
        userRepository.save(donor2);
        userRepository.save(ngo1);
        userRepository.save(vol1);

        FoodListing l1 = new FoodListing();
        l1.setId("lst_1");
        l1.setDonorId("usr_donor_1");
        l1.setTitle("Freshly Baked Artisan Focaccia & Lasagna Trays");
        l1.setDescription("Surplus lunch trays of oven-baked Mediterranean vegetable lasagna and garlic herb focaccia loaves.");
        l1.setFoodType("Veg");
        l1.setQuantityValue(35);
        l1.setQuantityUnit("servings");
        l1.setServingsEst(35);
        l1.setWeightKgEst(14.5);
        l1.setPrepTime("Today, 1:00 PM");
        l1.setExpiryTime(Instant.now().plus(2, ChronoUnit.HOURS).toString());
        l1.setExpiryWindowDesc("Best before 2 hours (Serve Hot)");
        l1.setPickupAddress("742 Evergreen Terrace (Kitchen Rear Door)");
        l1.setContactPhone("+1 (555) 234-8901");
        l1.setImageUrl("https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80");
        l1.setStatus("Available");
        listingRepository.save(l1);

        FoodListing l2 = new FoodListing();
        l2.setId("lst_2");
        l2.setDonorId("usr_donor_2");
        l2.setTitle("Corporate Buffet Excess: Basmati Biryani & Dal Makhani");
        l2.setDescription("Aromatic basmati biryani with slow-cooked lentils and steamed vegetables.");
        l2.setFoodType("Vegan");
        l2.setQuantityValue(50);
        l2.setQuantityUnit("servings");
        l2.setServingsEst(50);
        l2.setWeightKgEst(22.0);
        l2.setPrepTime("Today, 2:30 PM");
        l2.setExpiryTime(Instant.now().plus(4, ChronoUnit.HOURS).toString());
        l2.setExpiryWindowDesc("Best before 4 hours");
        l2.setPickupAddress("120 Grand Plaza Boulevard, Service Bay B");
        l2.setContactPhone("+1 (555) 345-6789");
        l2.setImageUrl("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80");
        l2.setStatus("Available");
        listingRepository.save(l2);

        System.out.println("✅ [Java Spring Boot] Seeded successfully.");
    }
}
