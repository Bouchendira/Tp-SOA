package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.ModeLivraison;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class LocationRequestDTO {

    @NotNull(message = "Le client est obligatoire")
    private UUID clientId;

    @NotNull(message = "La machine est obligatoire")
    private UUID machineId;

    @NotNull(message = "La date de debut est obligatoire")
    @FutureOrPresent(message = "La date de debut ne peut pas etre dans le passe")
    private LocalDate dateDebut;

    @NotNull(message = "La date de fin prevue est obligatoire")
    private LocalDate dateFinPrevue;

    private Double caution;
    private Double fraisTransport;
    private ModeLivraison modeLivraison;
}