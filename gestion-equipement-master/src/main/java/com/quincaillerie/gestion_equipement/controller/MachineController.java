package com.quincaillerie.gestion_equipement.controller;

import com.quincaillerie.gestion_equipement.dto.MachineRequestDTO;
import com.quincaillerie.gestion_equipement.dto.MachineResponseDTO;
import com.quincaillerie.gestion_equipement.service.MachineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @GetMapping
    public List<MachineResponseDTO> getAll() {
        return machineService.getAll();
    }

    @GetMapping("/{id}")
    public MachineResponseDTO getById(@PathVariable UUID id) {
        return machineService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MachineResponseDTO create(@Valid @RequestBody MachineRequestDTO dto) {
        return machineService.create(dto);
    }

    @PutMapping("/{id}")
    public MachineResponseDTO update(@PathVariable UUID id, @Valid @RequestBody MachineRequestDTO dto) {
        return machineService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        machineService.delete(id);
    }
}