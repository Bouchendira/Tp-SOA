package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.ModePaiement;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class VenteResponseDTO {
    private UUID id;
    private LocalDate date;
    private UUID clientId;
    private String clientNom;
    private UUID employeId;
    private String employeNom;
    private ModePaiement modePaiement;
    private Double fraisTransport;
    private List<LigneVenteResponseDTO> lignes;
    private Double montantTotalHT;
    private Double montantTotalTVA;
    private Double montantTotalTTC;
}