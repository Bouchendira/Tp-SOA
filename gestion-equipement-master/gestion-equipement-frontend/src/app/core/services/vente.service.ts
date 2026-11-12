import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiCrudService } from './api-crud.service';
import { ModePaiement, Vente } from '../models/vente.model';
import { ClientService } from './client.service';
import { MachineService } from './machine.service';
import { ArticleQuincaillerieService } from './article-quincaillerie.service';
import { EtatEquipement, EquipementBase, Machine } from '../models/equipement.model';
import { tap } from 'rxjs/operators';

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
export class VenteService extends ApiCrudService<Vente> {
  constructor(
    http: HttpClient,
    private clientService: ClientService,
    private machineService: MachineService,
    private articleService: ArticleQuincaillerieService
  ) {
    super(http, '/api/achats');
  }

  /**
   * Purchase totals are computed from catalogue prices and received
   * quantities are added back into inventory.
   */
  createVente(input: CreateVenteInput): Observable<Vente> {
    if (!input.lignes.length) {
      return throwError(() => new Error('Un achat doit comporter au moins une ligne'));
    }

    const client = this.clientService.getById(input.clientId);
    if (!client) {
      return throwError(() => new Error('Fournisseur introuvable'));
    }

    const catalogue: Array<{ machine?: Machine; article?: EquipementBase & { quantiteStock: number } }> = [];
    const seenEquipementIds = new Set<string>();
    for (const line of input.lignes) {
      if (seenEquipementIds.has(line.equipementId)) {
        return throwError(() => new Error('Un equipement peut figurer une seule fois dans un achat'));
      }
      seenEquipementIds.add(line.equipementId);

      if (!Number.isInteger(line.quantite) || line.quantite < 1) {
        return throwError(() => new Error('La quantite achetee doit etre un entier positif'));
      }

      const machine = this.machineService.getById(line.equipementId);
      const article = this.articleService.getById(line.equipementId);
      if (!machine && !article) {
        return throwError(() => new Error(`Equipement introuvable: ${line.equipementId}`));
      }
      if (machine && (line.quantite !== 1 || !canPurchaseMachine(machine))) {
        return throwError(() => new Error(`La machine "${machine.nom}" ne peut pas etre ajoutee a cet achat`));
      }

      catalogue.push({ machine, article });
    }
    return this.createRequest({
      clientId: client.id,
      modePaiement: input.modePaiement,
      fraisTransport: input.fraisTransport,
      lignes: input.lignes.map(({ equipementId, quantite }) => ({ equipementId, quantite })),
    }).pipe(
      tap(() => {
        for (const [index, item] of catalogue.entries()) {
          const line = input.lignes[index];
          if (item.machine) {
            this.machineService.updateLocal(item.machine.id, { etat: EtatEquipement.DISPONIBLE });
          } else if (item.article) {
            this.articleService.updateLocal(item.article.id, {
              quantiteStock: item.article.quantiteStock + line.quantite,
              etat: EtatEquipement.DISPONIBLE,
            });
          }
        }
      })
    );
  }
}

function canPurchaseMachine(machine: Machine): boolean {
  return [
    EtatEquipement.A_COMMANDER,
    EtatEquipement.VENDU,
    EtatEquipement.RETIRE,
    EtatEquipement.RETOURNE_FOURNISSEUR,
  ].includes(machine.etat);
}
