package com.quincaillerie.gestion_equipement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "article_quincaillerie")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ArticleQuincaillerie extends Equipement{
    @Column(name = "quantite_stock", nullable = false)
    private Integer quantiteStock;

    private String unite;

    @Column(name = "seuil_reappro")
    private Integer seuilReappro;

    @Column(name = "code_barre", unique = true)
    private String codeBarre;
}
