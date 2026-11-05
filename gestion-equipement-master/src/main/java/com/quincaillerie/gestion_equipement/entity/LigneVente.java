package com.quincaillerie.gestion_equipement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "ligne_vente")
@Data
@NoArgsConstructor
public class LigneVente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Integer quantite;

    @Column(name = "prix_unitaire_ht", nullable = false)
    private Double prixUnitaireHT;

    @Column(name = "taux_tva", nullable = false)
    private Double tauxTVA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vente_id", nullable = false)
    private Vente vente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_id", nullable = false)
    private Equipement equipement;
}