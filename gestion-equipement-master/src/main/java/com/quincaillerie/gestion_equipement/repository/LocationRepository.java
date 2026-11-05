package com.quincaillerie.gestion_equipement.repository;

import com.quincaillerie.gestion_equipement.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID> {
}