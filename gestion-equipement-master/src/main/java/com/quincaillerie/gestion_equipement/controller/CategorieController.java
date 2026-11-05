package com.quincaillerie.gestion_equipement.controller;

import com.quincaillerie.gestion_equipement.dto.CategorieRequestDTO;
import com.quincaillerie.gestion_equipement.dto.CategorieResponseDTO;
import com.quincaillerie.gestion_equipement.service.CategorieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategorieController {

    private final CategorieService categorieService;

    @GetMapping
    public List<CategorieResponseDTO> getAll() {
        return categorieService.getAll();
    }

    @GetMapping("/{id}")
    public CategorieResponseDTO getById(@PathVariable UUID id) {
        return categorieService.getById(id);
    }
    @GetMapping("/nom/{nom}")
    public List<CategorieResponseDTO> getByNom(@PathVariable String nom) {
        return categorieService.getByName(nom);
    }
    @GetMapping("/desc/{description}")
    public List<CategorieResponseDTO> getByDescription(@PathVariable String description) {
        return categorieService.getByDescription(description);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategorieResponseDTO create(@Valid @RequestBody CategorieRequestDTO dto) {
        return categorieService.create(dto);
    }

    @PutMapping("/{id}")
    public CategorieResponseDTO update(@PathVariable UUID id, @Valid @RequestBody CategorieRequestDTO dto) {
        return categorieService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        categorieService.delete(id);
    }
}
