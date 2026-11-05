package com.quincaillerie.gestion_equipement.repository;

import com.quincaillerie.gestion_equipement.entity.Equipement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EquipementRepository extends JpaRepository<Equipement, UUID> {
}