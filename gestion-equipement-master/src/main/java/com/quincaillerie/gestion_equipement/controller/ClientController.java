package com.quincaillerie.gestion_equipement.controller;

import com.quincaillerie.gestion_equipement.dto.ClientRequestDTO;
import com.quincaillerie.gestion_equipement.dto.ClientResponseDTO;
import com.quincaillerie.gestion_equipement.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/clients", "/api/fournisseurs"})
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public List<ClientResponseDTO> getAll() {
        return clientService.getAll();
    }

    @GetMapping("/{id}")
    public ClientResponseDTO getById(@PathVariable UUID id) {
        return clientService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponseDTO create(@Valid @RequestBody ClientRequestDTO dto) {
        return clientService.create(dto);
    }

    @PutMapping("/{id}")
    public ClientResponseDTO update(@PathVariable UUID id, @Valid @RequestBody ClientRequestDTO dto) {
        return clientService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        clientService.delete(id);
    }
}