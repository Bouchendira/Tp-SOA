package com.quincaillerie.gestion_equipement.repository;

import com.quincaillerie.gestion_equipement.entity.ArticleQuincaillerie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ArticleQuincaillerieRepository extends JpaRepository<ArticleQuincaillerie, UUID> {
}