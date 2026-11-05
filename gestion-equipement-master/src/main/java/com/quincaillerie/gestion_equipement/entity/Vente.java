package com.quincaillerie.gestion_equipement.entity;

import com.quincaillerie.gestion_equipement.enums.ModePaiement;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vente")
@Data
@NoArgsConstructor
public class Vente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement", nullable = false)
    private ModePaiement modePaiement;

    @Column(name = "frais_transport")
    private Double fraisTransport;

    @Column(name = "montant_total_ht", nullable = false)
    private Double montantTotalHT;

    @Column(name = "montant_total_tva", nullable = false)
    private Double montantTotalTVA;

    @Column(name = "montant_total_ttc", nullable = false)
    private Double montantTotalTTC;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    @OneToMany(mappedBy = "vente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneVente> lignes = new ArrayList<>();
}