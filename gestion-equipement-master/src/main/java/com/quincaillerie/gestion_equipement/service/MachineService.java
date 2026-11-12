package com.quincaillerie.gestion_equipement.service;

import com.quincaillerie.gestion_equipement.dto.MachineRequestDTO;
import com.quincaillerie.gestion_equipement.dto.MachineResponseDTO;
import com.quincaillerie.gestion_equipement.entity.Categorie;
import com.quincaillerie.gestion_equipement.entity.Machine;
import com.quincaillerie.gestion_equipement.enums.ActionAffectation;
import com.quincaillerie.gestion_equipement.enums.EtatEquipement;
import com.quincaillerie.gestion_equipement.exception.InvalidClientDataException;
import com.quincaillerie.gestion_equipement.exception.MachineIndisponibleException;
import com.quincaillerie.gestion_equipement.exception.ResourceNotFoundException;
import com.quincaillerie.gestion_equipement.repository.CategorieRepository;
import com.quincaillerie.gestion_equipement.repository.EmployeRepository;
import com.quincaillerie.gestion_equipement.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;
    private final CategorieRepository categorieRepository;
    private final EmployeRepository employeRepository;

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
        String numeroSerie = normalizeNumeroSerie(dto.getNumeroSerie());
        if (numeroSerie != null && machineRepository.existsByNumeroSerieIgnoreCase(numeroSerie)) {
            throw new InvalidClientDataException("Ce numero de serie est deja utilise");
        }

        Machine machine = new Machine();
        applyDtoToEntity(dto, machine);
        machine.setNumeroSerie(numeroSerie);
        machine.setCategorie(categorie);
        machine.setEtat(EtatEquipement.A_COMMANDER);

        Machine saved = machineRepository.save(machine);
        return toResponseDTO(saved);
    }

    public MachineResponseDTO update(UUID id, MachineRequestDTO dto) {
        Machine machine = machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Machine introuvable avec id: " + id));

        Categorie categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie introuvable avec id: " + dto.getCategorieId()));
        String numeroSerie = normalizeNumeroSerie(dto.getNumeroSerie());
        if (numeroSerie != null && machineRepository.existsByNumeroSerieIgnoreCaseAndIdNot(numeroSerie, id)) {
            throw new InvalidClientDataException("Ce numero de serie est deja utilise");
        }

        applyDtoToEntity(dto, machine);
        machine.setNumeroSerie(numeroSerie);
        machine.setCategorie(categorie);

        Machine updated = machineRepository.save(machine);
        return toResponseDTO(updated);
    }

    public MachineResponseDTO updateEtat(UUID id, EtatEquipement etat) {
        Machine machine = machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipement introuvable avec id: " + id));

        if (!etatModifiable(etat) || !etatModifiable(machine.getEtat())) {
            throw new MachineIndisponibleException(
                    "Cet etat est gere par le processus de location ou d'achat et ne peut pas etre modifie ici");
        }

        machine.setEtat(etat);
        machine.setEmployeAffecte(null);
        return toResponseDTO(machineRepository.save(machine));
    }

    public MachineResponseDTO gererAffectation(UUID id, ActionAffectation action, Authentication authentication) {
        Machine machine = machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipement introuvable avec id: " + id));
        var employe = employeRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Employe introuvable: " + authentication.getName()));
        boolean magasinier = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_MAGASINIER")
                        || authority.getAuthority().equals("ROLE_ADMINISTRATEUR"));

        if (action == ActionAffectation.PRENDRE) {
            if (magasinier) {
                throw new MachineIndisponibleException("Seul un agent peut prendre un equipement en charge");
            }
            if (machine.getEtat() != EtatEquipement.DISPONIBLE) {
                throw new MachineIndisponibleException("Cet equipement n'est pas disponible dans le stock");
            }
            machine.setEtat(EtatEquipement.AFFECTE);
            machine.setEmployeAffecte(employe);
        } else if (action == ActionAffectation.RETOURNER) {
            if (machine.getEtat() != EtatEquipement.AFFECTE) {
                throw new MachineIndisponibleException("Cet equipement n'est pas affecte a un employe");
            }
            if (!magasinier && !employe.getId().equals(machine.getEmployeAffecte().getId())) {
                throw new MachineIndisponibleException("Vous ne pouvez retourner que l'equipement qui vous est affecte");
            }
            machine.setEtat(EtatEquipement.DISPONIBLE);
            machine.setEmployeAffecte(null);
        } else {
            throw new MachineIndisponibleException("Action d'affectation invalide");
        }

        return toResponseDTO(machineRepository.save(machine));
    }

    private boolean etatModifiable(EtatEquipement etat) {
        return etat == EtatEquipement.A_COMMANDER
                || etat == EtatEquipement.DISPONIBLE
                || etat == EtatEquipement.EN_MAINTENANCE
                || etat == EtatEquipement.RETIRE;
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
        machine.setPrixLocationJourHT(dto.getPrixLocationJourHT());
        machine.setDateAcquisition(dto.getDateAcquisition());
        machine.setIntervalleMaintenanceJours(dto.getIntervalleMaintenanceJours());
        machine.setCaution(dto.getCaution());
    }

    private String normalizeNumeroSerie(String numeroSerie) {
        if (numeroSerie == null || numeroSerie.isBlank()) {
            return null;
        }
        return numeroSerie.trim();
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
                machine.getCaution(),
                machine.getEmployeAffecte() == null ? null : machine.getEmployeAffecte().getId(),
                machine.getEmployeAffecte() == null ? null : machine.getEmployeAffecte().getNom()
        );
    }
}