package com.quincaillerie.gestion_equipement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CategorieResponseDTO {
    private UUID id;
    private String nom;
    private String description;
}