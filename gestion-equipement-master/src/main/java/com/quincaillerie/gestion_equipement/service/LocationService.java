package com.quincaillerie.gestion_equipement.service;

import com.quincaillerie.gestion_equipement.dto.LocationRequestDTO;
import com.quincaillerie.gestion_equipement.dto.LocationResponseDTO;
import com.quincaillerie.gestion_equipement.entity.Client;
import com.quincaillerie.gestion_equipement.entity.Employe;
import com.quincaillerie.gestion_equipement.entity.Location;
import com.quincaillerie.gestion_equipement.entity.Machine;
import com.quincaillerie.gestion_equipement.enums.EtatEquipement;
import com.quincaillerie.gestion_equipement.enums.StatutLocation;
import com.quincaillerie.gestion_equipement.exception.InvalidClientDataException;
import com.quincaillerie.gestion_equipement.exception.MachineIndisponibleException;
import com.quincaillerie.gestion_equipement.exception.ResourceNotFoundException;
import com.quincaillerie.gestion_equipement.repository.ClientRepository;
import com.quincaillerie.gestion_equipement.repository.EmployeRepository;
import com.quincaillerie.gestion_equipement.repository.LocationRepository;
import com.quincaillerie.gestion_equipement.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final ClientRepository clientRepository;
    private final MachineRepository machineRepository;
    private final EmployeRepository employeRepository;

    public List<LocationResponseDTO> getAll() {
        return locationRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public LocationResponseDTO getById(UUID id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location introuvable avec id: " + id));
        return toResponseDTO(location);
    }

    @Transactional
    public LocationResponseDTO create(LocationRequestDTO dto) {
        // 1. Dates coherentes
        if (!dto.getDateFinPrevue().isAfter(dto.getDateDebut())) {
            throw new InvalidClientDataException(
                    "La date de fin prevue doit etre posterieure a la date de debut");
        }

        // 2. Fournisseur existe
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fournisseur introuvable avec id: " + dto.getClientId()));

        // 3. Machine existe
        Machine machine = machineRepository.findById(dto.getMachineId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Machine introuvable avec id: " + dto.getMachineId()));

        // 4. Machine disponible
        if (machine.getEtat() != EtatEquipement.DISPONIBLE) {
            throw new MachineIndisponibleException(
                    "La machine '" + machine.getNom() + "' n'est pas disponible (etat actuel: "
                            + machine.getEtat() + ")");
        }

        // 5. Agent courant (recupere depuis le contexte de securite)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employe employe = employeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employe introuvable: " + email));

        // 6. Creation de la location + mise a jour de l'etat de la machine
        Location location = new Location();
        location.setDateDebut(dto.getDateDebut());
        location.setDateFinPrevue(dto.getDateFinPrevue());
        location.setStatut(StatutLocation.EN_COURS);
        location.setCaution(dto.getCaution());
        location.setFraisTransport(dto.getFraisTransport());
        location.setModeLivraison(dto.getModeLivraison());
        location.setClient(client);
        location.setMachine(machine);
        location.setEmploye(employe);

        machine.setEtat(EtatEquipement.LOUE);
        machineRepository.save(machine);

        Location saved = locationRepository.save(location);
        return toResponseDTO(saved);
    }

    @Transactional
    public LocationResponseDTO terminerLocation(UUID id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location introuvable avec id: " + id));

        LocalDate today = LocalDate.now();
        location.setDateRetour(today);
        location.setStatut(StatutLocation.TERMINEE);

        if (today.isAfter(location.getDateFinPrevue())) {
            long joursRetard = location.getDateFinPrevue().until(today).getDays();
            location.setPenaliteRetard(joursRetard * 20.0); // TODO : regle metier a affiner
        }

        Machine machine = location.getMachine();
        machine.setEtat(EtatEquipement.RETOURNE_FOURNISSEUR);
        machineRepository.save(machine);

        Location updated = locationRepository.save(location);
        return toResponseDTO(updated);
    }

    private LocationResponseDTO toResponseDTO(Location location) {
        return new LocationResponseDTO(
                location.getId(),
                location.getDateDebut(),
                location.getDateFinPrevue(),
                location.getDateRetour(),
                location.getStatut(),
                location.getCaution(),
                location.getPenaliteRetard(),
                location.getFraisTransport(),
                location.getModeLivraison(),
                location.getClient().getId(),
                location.getClient().getNom(),
                location.getMachine().getId(),
                location.getMachine().getNom(),
                location.getEmploye().getId(),
                location.getEmploye().getNom()
        );
    }
}