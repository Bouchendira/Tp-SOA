package com.quincaillerie.gestion_equipement.service;

import com.quincaillerie.gestion_equipement.dto.MachineRequestDTO;
import com.quincaillerie.gestion_equipement.dto.MachineResponseDTO;
import com.quincaillerie.gestion_equipement.entity.Categorie;
import com.quincaillerie.gestion_equipement.entity.Machine;
import com.quincaillerie.gestion_equipement.enums.EtatEquipement;
import com.quincaillerie.gestion_equipement.exception.ResourceNotFoundException;
import com.quincaillerie.gestion_equipement.repository.CategorieRepository;
import com.quincaillerie.gestion_equipement.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;
    private final CategorieRepository categorieRepository;

    public List<MachineResponseDTO> getAll() {
        return machineRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public MachineResponseDTO getById(UUID id) {
        Machine machine = machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Machine introuvable avec id: " + id));
        return toResponseDTO(machine);
    }

    public MachineResponseDTO create(MachineRequestDTO dto) {
        Categorie categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie introuvable avec id: " + dto.getCategorieId()));

        Machine machine = new Machine();
        applyDtoToEntity(dto, machine);
        machine.setCategorie(categorie);
        machine.setEtat(EtatEquipement.DISPONIBLE);

        Machine saved = machineRepository.save(machine);
        return toResponseDTO(saved);
    }

    public MachineResponseDTO update(UUID id, MachineRequestDTO dto) {
        Machine machine = machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Machine introuvable avec id: " + id));

        Categorie categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie introuvable avec id: " + dto.getCategorieId()));

        applyDtoToEntity(dto, machine);
        machine.setCategorie(categorie);

        Machine updated = machineRepository.save(machine);
        return toResponseDTO(updated);
    }

    public void delete(UUID id) {
        if (!machineRepository.existsById(id)) {
            throw new ResourceNotFoundException("Machine introuvable avec id: " + id);
        }
        machineRepository.deleteById(id);
    }

    private void applyDtoToEntity(MachineRequestDTO dto, Machine machine) {
        machine.setNom(dto.getNom());
        machine.setDescription(dto.getDescription());
        machine.setMarque(dto.getMarque());
        machine.setModele(dto.getModele());
        machine.setPrixVenteHT(dto.getPrixVenteHT());
        machine.setTauxTVA(dto.getTauxTVA());
        machine.setNumeroSerie(dto.getNumeroSerie());
        machine.setPrixLocationJourHT(dto.getPrixLocationJourHT());
        machine.setDateAcquisition(dto.getDateAcquisition());
        machine.setIntervalleMaintenanceJours(dto.getIntervalleMaintenanceJours());
        machine.setCaution(dto.getCaution());
    }

    private MachineResponseDTO toResponseDTO(Machine machine) {
        return new MachineResponseDTO(
                machine.getId(),
                machine.getNom(),
                machine.getDescription(),
                machine.getMarque(),
                machine.getModele(),
                machine.getPrixVenteHT(),
                machine.getTauxTVA(),
                machine.getEtat(),
                machine.getCategorie().getId(),
                machine.getCategorie().getNom(),
                machine.getNumeroSerie(),
                machine.getPrixLocationJourHT(),
                machine.getDateAcquisition(),
                machine.getIntervalleMaintenanceJours(),
                machine.getCaution()
        );
    }
}