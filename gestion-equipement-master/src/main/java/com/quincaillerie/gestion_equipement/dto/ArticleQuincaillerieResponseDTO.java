package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.EtatEquipement;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class ArticleQuincaillerieResponseDTO {
    private UUID id;
    private String nom;
    private String description;
    private String marque;
    private String modele;
    private Double prixVenteHT;
    private Double tauxTVA;
    private EtatEquipement etat;
    private UUID categorieId;
    private String categorieNom;
    private Integer quantiteStock;
    private String unite;
    private Integer seuilReappro;
    private String codeBarre;
}