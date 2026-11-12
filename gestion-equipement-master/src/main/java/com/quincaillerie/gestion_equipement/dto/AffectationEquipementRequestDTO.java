package com.quincaillerie.gestion_equipement.dto;

import com.quincaillerie.gestion_equipement.enums.ActionAffectation;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AffectationEquipementRequestDTO {

    @NotNull(message = "L'action est obligatoire")
    private ActionAffectation action;
}
