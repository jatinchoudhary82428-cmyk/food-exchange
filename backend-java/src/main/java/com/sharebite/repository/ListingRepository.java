package com.sharebite.repository;

import com.sharebite.model.FoodListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<FoodListing, String> {
    List<FoodListing> findByStatus(String status);
    List<FoodListing> findByDonorId(String donorId);

    @Query("SELECT l FROM FoodListing l ORDER BY CASE WHEN l.status = 'Available' THEN 1 WHEN l.status = 'Claimed' THEN 2 ELSE 3 END, l.createdAt DESC")
    List<FoodListing> findAllOrdered();

    long countByStatus(String status);
}
