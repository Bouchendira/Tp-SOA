package com.quincaillerie.gestion_equipement.service;

import com.quincaillerie.gestion_equipement.dto.ArticleQuincaillerieRequestDTO;
import com.quincaillerie.gestion_equipement.dto.ArticleQuincaillerieResponseDTO;
import com.quincaillerie.gestion_equipement.entity.ArticleQuincaillerie;
import com.quincaillerie.gestion_equipement.entity.Categorie;
import com.quincaillerie.gestion_equipement.enums.EtatEquipement;
import com.quincaillerie.gestion_equipement.exception.ResourceNotFoundException;
import com.quincaillerie.gestion_equipement.repository.ArticleQuincaillerieRepository;
import com.quincaillerie.gestion_equipement.repository.CategorieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArticleQuincaillerieService {

    private final ArticleQuincaillerieRepository articleRepository;
    private final CategorieRepository categorieRepository;

    public List<ArticleQuincaillerieResponseDTO> getAll() {
        return articleRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ArticleQuincaillerieResponseDTO getById(UUID id) {
        ArticleQuincaillerie article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article introuvable avec id: " + id));
        return toResponseDTO(article);
    }

    public ArticleQuincaillerieResponseDTO create(ArticleQuincaillerieRequestDTO dto) {
        Categorie categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie introuvable avec id: " + dto.getCategorieId()));

        ArticleQuincaillerie article = new ArticleQuincaillerie();
        applyDtoToEntity(dto, article);
        article.setCategorie(categorie);
        article.setEtat(dto.getQuantiteStock() > 0 ? EtatEquipement.DISPONIBLE : EtatEquipement.RETIRE);

        ArticleQuincaillerie saved = articleRepository.save(article);
        return toResponseDTO(saved);
    }

    public ArticleQuincaillerieResponseDTO update(UUID id, ArticleQuincaillerieRequestDTO dto) {
        ArticleQuincaillerie article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article introuvable avec id: " + id));

        Categorie categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie introuvable avec id: " + dto.getCategorieId()));

        applyDtoToEntity(dto, article);
        article.setCategorie(categorie);

        ArticleQuincaillerie updated = articleRepository.save(article);
        return toResponseDTO(updated);
    }

    public void delete(UUID id) {
        if (!articleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Article introuvable avec id: " + id);
        }
        articleRepository.deleteById(id);
    }

    private void applyDtoToEntity(ArticleQuincaillerieRequestDTO dto, ArticleQuincaillerie article) {
        article.setNom(dto.getNom());
        article.setDescription(dto.getDescription());
        article.setMarque(dto.getMarque());
        article.setModele(dto.getModele());
        article.setPrixVenteHT(dto.getPrixVenteHT());
        article.setTauxTVA(dto.getTauxTVA());
        article.setQuantiteStock(dto.getQuantiteStock());
        article.setUnite(dto.getUnite());
        article.setSeuilReappro(dto.getSeuilReappro());
        article.setCodeBarre(dto.getCodeBarre());
    }

    private ArticleQuincaillerieResponseDTO toResponseDTO(ArticleQuincaillerie article) {
        return new ArticleQuincaillerieResponseDTO(
                article.getId(),
                article.getNom(),
                article.getDescription(),
                article.getMarque(),
                article.getModele(),
                article.getPrixVenteHT(),
                article.getTauxTVA(),
                article.getEtat(),
                article.getCategorie().getId(),
                article.getCategorie().getNom(),
                article.getQuantiteStock(),
                article.getUnite(),
                article.getSeuilReappro(),
                article.getCodeBarre()
        );
    }
}