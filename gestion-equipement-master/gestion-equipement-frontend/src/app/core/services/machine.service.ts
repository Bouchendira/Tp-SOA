import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiCrudService } from './api-crud.service';
import { EtatEquipement, Machine } from '../models/equipement.model';
import { CategorieService } from './categorie.service';
import { AuthService } from './auth.service';
import { RoleEmploye } from '../models/employe.model';

@Injectable({ providedIn: 'root' })
export class MachineService extends ApiCrudService<Machine> {
  constructor(http: HttpClient, private categorieService: CategorieService, private authService: AuthService) {
    super(http, '/api/machines');
  }

  /**
   * Mirrors MachineService#create on the backend: a newly created
   * machine must be received through an achat before becoming available.
   */
  createMachine(data: Omit<Machine, 'id' | 'etat' | 'categorieNom'>): Observable<Machine> {
    const categorie = this.categorieService.getById(data.categorieId);
    return this.create({
      ...data,
      etat: EtatEquipement.A_COMMANDER,
      categorieNom: categorie?.nom,
    });
  }

  /** Business action: marks a machine as under maintenance. */
  setEnMaintenance(id: string): Observable<Machine | undefined> {
    return this.updateEtat(id, EtatEquipement.EN_MAINTENANCE);
  }

  setDisponible(id: string): Observable<Machine | undefined> {
    return this.updateEtat(id, EtatEquipement.DISPONIBLE);
  }

  updateEtat(id: string, etat: EtatEquipement): Observable<Machine | undefined> {
    const machine = this.getById(id);
    const etatsModifiables = [
      EtatEquipement.A_COMMANDER,
      EtatEquipement.DISPONIBLE,
      EtatEquipement.EN_MAINTENANCE,
      EtatEquipement.RETIRE,
    ];

    if (!machine) {
      return throwError(() => new Error('Equipement introuvable'));
    }
    if (!etatsModifiables.includes(machine.etat) || !etatsModifiables.includes(etat)) {
      return throwError(() => new Error("Cet etat est gere par le processus d'achat ou de location"));
    }

    return this.patchRequest(id, 'etat', { etat });
  }

  prendreEnCharge(id: string): Observable<Machine | undefined> {
    const machine = this.getById(id);
    const user = this.authService.currentUser();
    if (
      !this.authService.hasRole(RoleEmploye.AGENT)
      || !machine
      || machine.etat !== EtatEquipement.DISPONIBLE
      || !user
    ) {
      return throwError(() => new Error("Cet equipement n'est pas disponible"));
    }

    return this.patchRequest(id, 'affectation', { action: 'PRENDRE' });
  }

  retournerAuStock(id: string, magasinier = false): Observable<Machine | undefined> {
    const machine = this.getById(id);
    const user = this.authService.currentUser();
    const peutRetournerTout = this.authService.hasRole(RoleEmploye.ADMINISTRATEUR, RoleEmploye.MAGASINIER);
    if (
      !machine
      || machine.etat !== EtatEquipement.AFFECTE
      || (!peutRetournerTout && (!this.authService.hasRole(RoleEmploye.AGENT) || machine.employeAffecteId !== user?.id))
      || (magasinier && !peutRetournerTout)
    ) {
      return throwError(() => new Error("Vous ne pouvez retourner que l'equipement qui vous est affecte"));
    }

    return this.patchRequest(id, 'affectation', { action: 'RETOURNER' });
  }

  protected override toRequest(machine: Partial<Machine>): unknown {
    const {
      id: _id,
      etat: _etat,
      categorieNom: _categorieNom,
      employeAffecteId: _employeAffecteId,
      employeAffecteNom: _employeAffecteNom,
      ...request
    } = machine;
    return {
      ...request,
      numeroSerie: request.numeroSerie?.trim() || null,
    };
  }
}
