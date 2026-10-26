package com.sharebite.repository;

import com.sharebite.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, String> {
    List<Claim> findByListingId(String listingId);
    List<Claim> findByNgoId(String ngoId);
    List<Claim> findByVolunteerId(String volunteerId);
}
