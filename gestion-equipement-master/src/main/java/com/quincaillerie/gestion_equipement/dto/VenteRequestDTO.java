package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.ModePaiement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class VenteRequestDTO {

    @NotNull(message = "Le fournisseur est obligatoire")
    private UUID clientId;

    @NotNull(message = "Le mode de paiement est obligatoire")
    private ModePaiement modePaiement;

    private Double fraisTransport;

    @NotEmpty(message = "Un achat doit comporter au moins une ligne")
    @Valid
    private List<LigneVenteRequestDTO> lignes;
}