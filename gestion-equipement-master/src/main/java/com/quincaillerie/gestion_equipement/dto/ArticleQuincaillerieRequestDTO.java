package com.quincaillerie.gestion_equipement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.UUID;

@Data
public class ArticleQuincaillerieRequestDTO {

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

    @NotNull(message = "La quantite en stock est obligatoire")
    @PositiveOrZero(message = "La quantite en stock ne peut pas etre negative")
    private Integer quantiteStock;

    private String unite;
    private Integer seuilReappro;
    private String codeBarre;
}