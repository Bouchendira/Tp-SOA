package com.quincaillerie.gestion_equipement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDTO {
    @NotBlank
    private String email;

    @NotBlank
    private String motDePasse;
}