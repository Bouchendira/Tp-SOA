package com.quincaillerie.gestion_equipement.entity;

import com.quincaillerie.gestion_equipement.enums.RoleEmploye;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "employe")
@Data
@NoArgsConstructor
public class Employe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String cin;

    @Column(nullable = false, unique = true)
    private String email;

    private String telephone;

    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleEmploye role;
}