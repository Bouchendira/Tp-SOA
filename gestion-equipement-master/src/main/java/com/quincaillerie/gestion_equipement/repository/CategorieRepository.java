package com.quincaillerie.gestion_equipement.repository;

import com.quincaillerie.gestion_equipement.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategorieRepository extends JpaRepository<Categorie, UUID> {

    List<Categorie> findCategoriesByNom(String nom);
    List<Categorie> findCategoriesByDescriptionContainingIgnoreCase(String description);
}
