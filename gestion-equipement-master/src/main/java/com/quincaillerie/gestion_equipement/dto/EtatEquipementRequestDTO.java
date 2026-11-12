package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.EtatEquipement;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EtatEquipementRequestDTO {

    @NotNull(message = "L'etat est obligatoire")
    private EtatEquipement etat;
}
