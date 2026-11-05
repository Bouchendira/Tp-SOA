package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.TypeClient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClientRequestDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotNull(message = "Le type de client est obligatoire")
    private TypeClient typeClient;

    private String matriculeFiscal;
    private String cin;
    private String telephone;

    @Email(message = "Email invalide")
    private String email;
}