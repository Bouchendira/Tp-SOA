package com.quincaillerie.gestion_equipement.entity;


import com.quincaillerie.gestion_equipement.enums.EtatEquipement;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
@Entity
@Table(name="equipement")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
public abstract class Equipement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nom;

    private String description;
    private String marque;
    private String modele;

    @Column(name = "prix_vente_ht", nullable = false)
    private Double prixVenteHT;

    @Column(name = "taux_tva", nullable = false)
    private Double tauxTVA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EtatEquipement etat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;


}
