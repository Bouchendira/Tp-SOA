package com.quincaillerie.gestion_equipement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "machine")
@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class Machine extends Equipement{
    @Column(name = "numero_serie", unique = true)
    private String numeroSerie;

    @Column(name = "prix_location_jour_ht", nullable = false)
    private Double prixLocationJourHT;

    @Column(name = "date_acquisition")
    private LocalDate dateAcquisition;

    @Column(name = "intervalle_maintenance_jours")
    private Integer intervalleMaintenanceJours;

    private Double caution;

}
