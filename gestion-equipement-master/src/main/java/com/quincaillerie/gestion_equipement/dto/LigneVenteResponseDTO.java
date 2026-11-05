package com.quincaillerie.gestion_equipement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class LigneVenteResponseDTO {
    private UUID id;
    private UUID equipementId;
    private String equipementNom;
    private Integer quantite;
    private Double prixUnitaireHT;
    private Double tauxTVA;
}