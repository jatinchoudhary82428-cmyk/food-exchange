package com.sharebite.controller;

import com.sharebite.service.ImpactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/impact")
public class ImpactController {

    @Autowired
    private ImpactService impactService;

    @GetMapping
    public ResponseEntity<?> getImpact() {
        Map<String, Object> impact = impactService.getImpactData();
        return ResponseEntity.ok(impact);
    }
}
