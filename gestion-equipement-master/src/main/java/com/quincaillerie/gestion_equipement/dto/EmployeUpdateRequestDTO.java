package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.RoleEmploye;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmployeUpdateRequestDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le CIN est obligatoire")
    private String cin;

    @Email(message = "Email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    private String telephone;

    @NotNull(message = "Le role est obligatoire")
    private RoleEmploye role;
}
