package com.quincaillerie.gestion_equipement.service;

import com.quincaillerie.gestion_equipement.dto.CategorieRequestDTO;
import com.quincaillerie.gestion_equipement.dto.CategorieResponseDTO;
import com.quincaillerie.gestion_equipement.entity.Categorie;
import com.quincaillerie.gestion_equipement.exception.ResourceNotFoundException;
import com.quincaillerie.gestion_equipement.repository.CategorieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategorieService {
    private final CategorieRepository categorieRepository;
    private CategorieResponseDTO toResponseDTO(Categorie categorie){
       return new  CategorieResponseDTO(categorie.getId(),categorie.getNom(),categorie.getDescription());
    }

    public List<CategorieResponseDTO> getAll(){
        return categorieRepository.findAll().stream().map(this::toResponseDTO).toList();
    }
    public CategorieResponseDTO getById (UUID id){
        Categorie categorie = categorieRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Categorie introuvable avec id: " + id));
        return toResponseDTO(categorie);
    }
    public List<CategorieResponseDTO> getByName(String nom){
        return  categorieRepository.findCategoriesByNom(nom).stream().map(this::toResponseDTO).toList();
    }
    public List<CategorieResponseDTO> getByDescription(String description){
        return categorieRepository.findCategoriesByDescriptionContainingIgnoreCase(description).stream().map(this::toResponseDTO).toList();
    }
    public CategorieResponseDTO create (CategorieRequestDTO dto){

        if (!categorieRepository.findCategoriesByNom(dto.getNom()).isEmpty()){
            throw new RuntimeException("La catégorie avec ce nom existe déjà.");
        }
        Categorie categorie =new Categorie();
        categorie.setNom(dto.getNom());
        categorie.setDescription(dto.getDescription());
        Categorie saved =categorieRepository.save(categorie);
        return toResponseDTO(saved);

    }
    public CategorieResponseDTO update (UUID id,CategorieRequestDTO dto){
        Categorie categorie = categorieRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Categorie introuvable avec id: " + id));
        categorie.setNom(dto.getNom());
        categorie.setDescription(dto.getDescription());
        Categorie updated =categorieRepository.save(categorie);
        return toResponseDTO(updated);

    }
    public void delete(UUID id) {
        if (!categorieRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categorie introuvable avec id: " + id);
        }
        categorieRepository.deleteById(id);
    }





}
