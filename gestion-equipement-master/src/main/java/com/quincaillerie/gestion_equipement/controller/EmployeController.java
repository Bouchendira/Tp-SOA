package com.quincaillerie.gestion_equipement.controller;

import com.quincaillerie.gestion_equipement.dto.EmployeRequestDTO;
import com.quincaillerie.gestion_equipement.dto.EmployeResponseDTO;
import com.quincaillerie.gestion_equipement.service.EmployeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employes")
@RequiredArgsConstructor
public class EmployeController {

    private final EmployeService employeService;

    @GetMapping
    public List<EmployeResponseDTO> getAll() {
        return employeService.getAll();
    }

    @GetMapping("/{id}")
    public EmployeResponseDTO getById(@PathVariable UUID id) {
        return employeService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeResponseDTO create(@Valid @RequestBody EmployeRequestDTO dto) {
        return employeService.create(dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        employeService.delete(id);
    }
}