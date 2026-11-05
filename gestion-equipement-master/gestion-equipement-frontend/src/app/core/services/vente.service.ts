import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { MockCrudService } from './mock-crud.service';
import { LigneVente, ModePaiement, Vente } from '../models/vente.model';
import { ClientService } from './client.service';
import { AuthService } from './auth.service';

export interface CreateVenteLigneInput {
  equipementId: string;
  equipementNom: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
}

export interface CreateVenteInput {
  clientId: string;
  modePaiement: ModePaiement;
  fraisTransport?: number;
  lignes: CreateVenteLigneInput[];
}

@Injectable({ providedIn: 'root' })
export class VenteService extends MockCrudService<Vente> {
  constructor(http: HttpClient, private clientService: ClientService, private authService: AuthService) {
    super(http, 'assets/data/ventes.json');
  }

  /**
   * Mirrors the Vente / LigneVente composition from the class diagram: a
   * sale requires at least one line, and its totals are computed from
   * those lines rather than entered directly (see chap3_conception.tex,
   * section on the association class LigneVente).
   */
  createVente(input: CreateVenteInput): Observable<Vente> {
    if (!input.lignes.length) {
      return throwError(() => new Error('Une vente doit comporter au moins une ligne'));
    }

    const client = this.clientService.getById(input.clientId);
    if (!client) {
      return throwError(() => new Error('Client introuvable'));
    }

    const lignes: LigneVente[] = input.lignes.map((l, i) => ({
      id: this.generateId(`lv-${i}`),
      equipementId: l.equipementId,
      equipementNom: l.equipementNom,
      quantite: l.quantite,
      prixUnitaireHT: l.prixUnitaireHT,
      tauxTVA: l.tauxTVA,
    }));

    const montantTotalHT = lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaireHT, 0);
    const montantTotalTVA = lignes.reduce(
      (sum, l) => sum + l.quantite * l.prixUnitaireHT * (l.tauxTVA / 100),
      0
    );

    const currentUser = this.authService.currentUser();

    const vente: Vente = {
      id: this.generateId('ven'),
      date: new Date().toISOString().slice(0, 10),
      clientId: client.id,
      clientNom: client.nom,
      employeId: currentUser?.id ?? '',
      employeNom: currentUser?.nom ?? '',
      modePaiement: input.modePaiement,
      fraisTransport: input.fraisTransport ?? 0,
      lignes,
      montantTotalHT: round2(montantTotalHT),
      montantTotalTVA: round2(montantTotalTVA),
      montantTotalTTC: round2(montantTotalHT + montantTotalTVA + (input.fraisTransport ?? 0)),
    };

    return this.create(vente);
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
