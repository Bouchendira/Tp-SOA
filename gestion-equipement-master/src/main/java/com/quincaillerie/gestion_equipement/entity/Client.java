package com.quincaillerie.gestion_equipement.entity;

import com.quincaillerie.gestion_equipement.enums.TypeClient;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "client")
@Data
@NoArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_client",
            nullable = false)
    private TypeClient typeClient;

    @Column(name = "matricule_fiscal")
    private String matriculeFiscal;

    private String cin;

    private String telephone;

    @Column(unique = true)
    private String email;
}