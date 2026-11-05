package com.quincaillerie.gestion_equipement.service;

import com.quincaillerie.gestion_equipement.dto.EmployeRequestDTO;
import com.quincaillerie.gestion_equipement.dto.EmployeResponseDTO;
import com.quincaillerie.gestion_equipement.entity.Employe;
import com.quincaillerie.gestion_equipement.enums.RoleEmploye;
import com.quincaillerie.gestion_equipement.exception.ResourceNotFoundException;
import com.quincaillerie.gestion_equipement.repository.EmployeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeService {

    private final EmployeRepository employeRepository;
    private final PasswordEncoder passwordEncoder;

    public List<EmployeResponseDTO> getAll() {
        return employeRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public EmployeResponseDTO getById(UUID id) {
        Employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employe introuvable " ));
        return toResponseDTO(employe);
    }

    public EmployeResponseDTO create(EmployeRequestDTO dto) {
        if (!employeRepository.existsEmployeByCinOrEmail(dto.getCin(), dto.getEmail())) {

            Employe employe = new Employe();
            employe.setNom(dto.getNom());
            employe.setCin(dto.getCin());
            employe.setEmail(dto.getEmail());
            employe.setTelephone(dto.getTelephone());
            employe.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
            employe.setRole(RoleEmploye.valueOf(dto.getRole().toUpperCase()));

            Employe saved = employeRepository.save(employe);
            return toResponseDTO(saved);

        } else {
            throw new IllegalArgumentException("Employé existe déjà.");

        }
    }

    public void delete(UUID id) {
        if (!employeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employe introuvable avec id: " + id);
        }
        employeRepository.deleteById(id);
    }

    private EmployeResponseDTO toResponseDTO(Employe employe) {
        return new EmployeResponseDTO(
                employe.getId(),
                employe.getNom(),
                employe.getCin(),
                employe.getEmail(),
                employe.getTelephone(),
                employe.getRole()
        );
    }
}