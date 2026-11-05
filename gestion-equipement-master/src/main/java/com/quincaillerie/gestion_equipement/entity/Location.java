package com.quincaillerie.gestion_equipement.entity;

import com.quincaillerie.gestion_equipement.enums.ModeLivraison;
import com.quincaillerie.gestion_equipement.enums.StatutLocation;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "location")
@Data
@NoArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin_prevue", nullable = false)
    private LocalDate dateFinPrevue;

    @Column(name = "date_retour")
    private LocalDate dateRetour;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutLocation statut;

    private Double caution;

    @Column(name = "penalite_retard")
    private Double penaliteRetard;

    @Column(name = "frais_transport")
    private Double fraisTransport;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_livraison")
    private ModeLivraison modeLivraison;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;
}