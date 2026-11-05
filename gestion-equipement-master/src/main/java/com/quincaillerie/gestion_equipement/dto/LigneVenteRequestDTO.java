package com.quincaillerie.gestion_equipement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.UUID;

@Data
public class LigneVenteRequestDTO {

    @NotNull(message = "L'equipement est obligatoire")
    private UUID equipementId;

    @NotNull(message = "La quantite est obligatoire")
    @Positive(message = "La quantite doit etre positive")
    private Integer quantite;
}