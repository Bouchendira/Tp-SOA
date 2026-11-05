package com.quincaillerie.gestion_equipement.repository;

import com.quincaillerie.gestion_equipement.entity.Vente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VenteRepository extends JpaRepository<Vente, UUID> {
}