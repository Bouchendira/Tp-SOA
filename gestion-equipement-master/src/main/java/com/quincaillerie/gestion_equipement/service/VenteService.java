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
                .orElseThrow(() -> new ResourceNotFoundException("Vente introuvable avec id: " + id));
        return toResponseDTO(vente);
    }

    @Transactional
    public VenteResponseDTO create(VenteRequestDTO dto) {
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable avec id: " + dto.getClientId()));

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

            if (equipement.getEtat() == EtatEquipement.VENDU || equipement.getEtat() == EtatEquipement.RETIRE) {
                throw new VenteInvalideException(
                        "L'equipement '" + equipement.getNom() + "' n'est plus disponible a la vente");
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

            appliquerImpactStock(equipement, ligneDto.getQuantite());
        }

        vente.setMontantTotalHT(round2(totalHT));
        vente.setMontantTotalTVA(round2(totalTVA));
        vente.setMontantTotalTTC(round2(totalHT + totalTVA + vente.getFraisTransport()));

        Vente saved = venteRepository.save(vente);
        return toResponseDTO(saved);
    }

    /**
     * Une Machine vendue passe a VENDU (elle n'est plus un bien de
     * location). Un ArticleQuincaillerie voit son stock decremente, et
     * repasse a RETIRE si le stock atteint zero - meme logique que
     * ArticleQuincaillerieService#create.
     */
    private void appliquerImpactStock(Equipement equipement, int quantiteVendue) {
        if (equipement instanceof Machine machine) {
            machine.setEtat(EtatEquipement.VENDU);
        } else if (equipement instanceof ArticleQuincaillerie article) {
            int nouveauStock = article.getQuantiteStock() - quantiteVendue;
            if (nouveauStock < 0) {
                throw new VenteInvalideException(
                        "Stock insuffisant pour '" + article.getNom() + "' (disponible: "
                                + article.getQuantiteStock() + ")");
            }
            article.setQuantiteStock(nouveauStock);
            article.setEtat(nouveauStock > 0 ? EtatEquipement.DISPONIBLE : EtatEquipement.RETIRE);
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