package com.quincaillerie.gestion_equipement.service;

import com.quincaillerie.gestion_equipement.dto.*;
import com.quincaillerie.gestion_equipement.entity.*;
import com.quincaillerie.gestion_equipement.enums.EtatEquipement;
import com.quincaillerie.gestion_equipement.exception.ResourceNotFoundException;
import com.quincaillerie.gestion_equipement.exception.VenteInvalideException;
import com.quincaillerie.gestion_equipement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VenteService {

    private final VenteRepository venteRepository;
    private final ClientRepository clientRepository;
    private final EquipementRepository equipementRepository;
    private final EmployeRepository employeRepository;

    public List<VenteResponseDTO> getAll() {
        return venteRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    public VenteResponseDTO getById(UUID id) {
        Vente vente = venteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Achat introuvable avec id: " + id));
        return toResponseDTO(vente);
    }

    @Transactional
    public VenteResponseDTO create(VenteRequestDTO dto) {
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur introuvable avec id: " + dto.getClientId()));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employe employe = employeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employe introuvable: " + email));

        Vente vente = new Vente();
        vente.setDate(LocalDate.now());
        vente.setModePaiement(dto.getModePaiement());
        vente.setFraisTransport(dto.getFraisTransport() != null ? dto.getFraisTransport() : 0.0);
        vente.setClient(client);
        vente.setEmploye(employe);

        double totalHT = 0;
        double totalTVA = 0;

        for (LigneVenteRequestDTO ligneDto : dto.getLignes()) {
            Equipement equipement = equipementRepository.findById(ligneDto.getEquipementId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Equipement introuvable avec id: " + ligneDto.getEquipementId()));

            if (ligneDto.getQuantite() < 1) {
                throw new VenteInvalideException("La quantite achetee doit etre positive");
            }
            if (equipement instanceof Machine machine
                    && (ligneDto.getQuantite() != 1 || !peutEtreAchetee(machine))) {
                throw new VenteInvalideException(
                        "La machine '" + equipement.getNom() + "' ne peut pas etre ajoutee a cet achat");
            }

            // Prix et TVA toujours pris depuis l'equipement, jamais depuis la requete client.
            LigneVente ligne = new LigneVente();
            ligne.setEquipement(equipement);
            ligne.setQuantite(ligneDto.getQuantite());
            ligne.setPrixUnitaireHT(equipement.getPrixVenteHT());
            ligne.setTauxTVA(equipement.getTauxTVA());
            ligne.setVente(vente);
            vente.getLignes().add(ligne);

            totalHT += ligne.getQuantite() * ligne.getPrixUnitaireHT();
            totalTVA += ligne.getQuantite() * ligne.getPrixUnitaireHT() * (ligne.getTauxTVA() / 100);

            appliquerEntreeStock(equipement, ligneDto.getQuantite());
        }

        vente.setMontantTotalHT(round2(totalHT));
        vente.setMontantTotalTVA(round2(totalTVA));
        vente.setMontantTotalTTC(round2(totalHT + totalTVA + vente.getFraisTransport()));

        Vente saved = venteRepository.save(vente);
        return toResponseDTO(saved);
    }

    /**
     * Purchased machines return to the company's inventory. Purchased
     * articles increase their on-hand quantity.
     */
    private boolean peutEtreAchetee(Machine machine) {
        return machine.getEtat() == EtatEquipement.A_COMMANDER
                || machine.getEtat() == EtatEquipement.VENDU
                || machine.getEtat() == EtatEquipement.RETIRE
                || machine.getEtat() == EtatEquipement.RETOURNE_FOURNISSEUR;
    }

    private void appliquerEntreeStock(Equipement equipement, int quantiteAchetee) {
        if (equipement instanceof Machine machine) {
            machine.setEtat(EtatEquipement.DISPONIBLE);
        } else if (equipement instanceof ArticleQuincaillerie article) {
            int nouveauStock = article.getQuantiteStock() + quantiteAchetee;
            article.setQuantiteStock(nouveauStock);
            article.setEtat(EtatEquipement.DISPONIBLE);
        }
        equipementRepository.save(equipement);
    }

    private VenteResponseDTO toResponseDTO(Vente vente) {
        List<LigneVenteResponseDTO> lignes = vente.getLignes().stream()
                .map(l -> new LigneVenteResponseDTO(
                        l.getId(),
                        l.getEquipement().getId(),
                        l.getEquipement().getNom(),
                        l.getQuantite(),
                        l.getPrixUnitaireHT(),
                        l.getTauxTVA()
                ))
                .toList();

        return new VenteResponseDTO(
                vente.getId(),
                vente.getDate(),
                vente.getClient().getId(),
                vente.getClient().getNom(),
                vente.getEmploye().getId(),
                vente.getEmploye().getNom(),
                vente.getModePaiement(),
                vente.getFraisTransport(),
                lignes,
                vente.getMontantTotalHT(),
                vente.getMontantTotalTVA(),
                vente.getMontantTotalTTC()
        );
    }

    private double round2(double value) {
        return Math.round(value * 100) / 100.0;
    }
}