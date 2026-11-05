package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.TypeClient;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class ClientResponseDTO {
    private UUID id;
    private String nom;
    private TypeClient typeClient;
    private String matriculeFiscal;
    private String cin;
    private String telephone;
    private String email;
}