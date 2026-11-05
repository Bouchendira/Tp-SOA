package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.ModeLivraison;
import com.quincaillerie.gestion_equipement.enums.StatutLocation;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
public class LocationResponseDTO {
    private UUID id;
    private LocalDate dateDebut;
    private LocalDate dateFinPrevue;
    private LocalDate dateRetour;
    private StatutLocation statut;
    private Double caution;
    private Double penaliteRetard;
    private Double fraisTransport;
    private ModeLivraison modeLivraison;
    private UUID clientId;
    private String clientNom;
    private UUID machineId;
    private String machineNom;
    private UUID employeId;
    private String employeNom;
}