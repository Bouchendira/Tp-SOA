package com.quincaillerie.gestion_equipement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class MachineRequestDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String description;
    private String marque;
    private String modele;

    @NotNull(message = "Le prix de vente est obligatoire")
    @Positive(message = "Le prix de vente doit etre positif")
    private Double prixVenteHT;

    @NotNull(message = "Le taux de TVA est obligatoire")
    private Double tauxTVA;

    @NotNull(message = "La categorie est obligatoire")
    private UUID categorieId;

    private String numeroSerie;

    @Positive(message = "Le prix de location doit etre positif")
    private Double prixLocationJourHT;

    private LocalDate dateAcquisition;
    private Integer intervalleMaintenanceJours;
    private Double caution;
}