package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.RoleEmploye;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class EmployeResponseDTO {
    private UUID id;
    private String nom;
    private String cin;
    private String email;
    private String telephone;
    private RoleEmploye role;
}