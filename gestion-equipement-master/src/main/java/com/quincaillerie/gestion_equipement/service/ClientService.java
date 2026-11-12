package com.quincaillerie.gestion_equipement.service;

import com.quincaillerie.gestion_equipement.dto.ClientRequestDTO;
import com.quincaillerie.gestion_equipement.dto.ClientResponseDTO;
import com.quincaillerie.gestion_equipement.entity.Client;
import com.quincaillerie.gestion_equipement.enums.TypeClient;
import com.quincaillerie.gestion_equipement.exception.InvalidClientDataException;
import com.quincaillerie.gestion_equipement.exception.ResourceNotFoundException;
import com.quincaillerie.gestion_equipement.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public List<ClientResponseDTO> getAll() {
        return clientRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ClientResponseDTO getById(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur introuvable avec id: " + id));
        return toResponseDTO(client);
    }

    public ClientResponseDTO create(ClientRequestDTO dto) {
        validateBusinessRules(dto);

        Client client = new Client();
        applyDtoToEntity(dto, client);

        Client saved = clientRepository.save(client);
        return toResponseDTO(saved);
    }

    public ClientResponseDTO update(UUID id, ClientRequestDTO dto) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur introuvable avec id: " + id));

        validateBusinessRules(dto);
        applyDtoToEntity(dto, client);

        Client updated = clientRepository.save(client);
        return toResponseDTO(updated);
    }

    public void delete(UUID id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fournisseur introuvable avec id: " + id);
        }
        clientRepository.deleteById(id);
    }

    private void validateBusinessRules(ClientRequestDTO dto) {
        if (dto.getTypeClient() == TypeClient.ENTREPRISE
                && (dto.getMatriculeFiscal() == null || dto.getMatriculeFiscal().isBlank())) {
            throw new InvalidClientDataException(
                    "Le matricule fiscal est obligatoire pour un fournisseur de type ENTREPRISE");
        }
        if (dto.getTypeClient() == TypeClient.PARTICULIER
                && (dto.getCin() == null || dto.getCin().isBlank())) {
            throw new InvalidClientDataException(
                    "Le CIN est obligatoire pour un fournisseur de type PARTICULIER");
        }
    }

    private void applyDtoToEntity(ClientRequestDTO dto, Client client) {
        client.setNom(dto.getNom());
        client.setTypeClient(dto.getTypeClient());
        client.setMatriculeFiscal(dto.getMatriculeFiscal());
        client.setCin(dto.getCin());
        client.setTelephone(dto.getTelephone());
        client.setEmail(dto.getEmail());
    }

    private ClientResponseDTO toResponseDTO(Client client) {
        return new ClientResponseDTO(
                client.getId(),
                client.getNom(),
                client.getTypeClient(),
                client.getMatriculeFiscal(),
                client.getCin(),
                client.getTelephone(),
                client.getEmail()
        );
    }
}