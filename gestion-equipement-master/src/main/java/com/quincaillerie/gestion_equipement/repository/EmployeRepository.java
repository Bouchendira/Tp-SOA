package com.quincaillerie.gestion_equipement.repository;

import com.quincaillerie.gestion_equipement.entity.Employe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmployeRepository extends JpaRepository<Employe, UUID> {
    Optional<Employe> findByEmail(String email);
    boolean existsEmployeByCinOrEmail(String cin,String email);

}