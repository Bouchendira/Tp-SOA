package com.quincaillerie.gestion_equipement.repository;

import com.quincaillerie.gestion_equipement.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MachineRepository extends JpaRepository<Machine, UUID> {
}
