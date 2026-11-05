package com.quincaillerie.gestion_equipement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategorieRequestDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String description;
}