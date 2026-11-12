package com.quincaillerie.gestion_equipement.controller;

import com.quincaillerie.gestion_equipement.dto.LocationRequestDTO;
import com.quincaillerie.gestion_equipement.dto.LocationResponseDTO;
import com.quincaillerie.gestion_equipement.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/locations", "/api/locations-fournisseurs"})
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public List<LocationResponseDTO> getAll() {
        return locationService.getAll();
    }

    @GetMapping("/{id}")
    public LocationResponseDTO getById(@PathVariable UUID id) {
        return locationService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LocationResponseDTO create(@Valid @RequestBody LocationRequestDTO dto) {
        return locationService.create(dto);
    }

    @PostMapping("/{id}/retour")
    public LocationResponseDTO terminerLocation(@PathVariable UUID id) {
        return locationService.terminerLocation(id);
    }
}