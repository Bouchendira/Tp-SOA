package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.RoleEmploye;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private UUID id;
    private String nom;
    private String email;
    private RoleEmploye role;
}