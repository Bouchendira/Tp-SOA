package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.RoleEmploye;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String nom;
    private RoleEmploye role;
}