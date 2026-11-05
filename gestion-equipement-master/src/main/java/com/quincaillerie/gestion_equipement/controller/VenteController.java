package com.quincaillerie.gestion_equipement.controller;

import com.quincaillerie.gestion_equipement.dto.VenteRequestDTO;
import com.quincaillerie.gestion_equipement.dto.VenteResponseDTO;
import com.quincaillerie.gestion_equipement.service.VenteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ventes")
@RequiredArgsConstructor
public class VenteController {

    private final VenteService venteService;

    @GetMapping
    public List<VenteResponseDTO> getAll() {
        return venteService.getAll();
    }

    @GetMapping("/{id}")
    public VenteResponseDTO getById(@PathVariable UUID id) {
        return venteService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VenteResponseDTO create(@Valid @RequestBody VenteRequestDTO dto) {
        return venteService.create(dto);
    }
}