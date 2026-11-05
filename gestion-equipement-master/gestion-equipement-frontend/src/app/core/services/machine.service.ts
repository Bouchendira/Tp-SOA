import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MockCrudService } from './mock-crud.service';
import { EtatEquipement, Machine } from '../models/equipement.model';
import { CategorieService } from './categorie.service';

@Injectable({ providedIn: 'root' })
export class MachineService extends MockCrudService<Machine> {
  constructor(http: HttpClient, private categorieService: CategorieService) {
    super(http, 'assets/data/machines.json');
  }

  /**
   * Mirrors MachineService#create on the backend: a newly created
   * machine always starts DISPONIBLE, regardless of what the form sends.
   */
  createMachine(data: Omit<Machine, 'id' | 'etat' | 'categorieNom'>): Observable<Machine> {
    const categorie = this.categorieService.getById(data.categorieId);
    const machine: Machine = {
      ...data,
      id: this.generateId('mac'),
      etat: EtatEquipement.DISPONIBLE,
      categorieNom: categorie?.nom,
    };
    return this.create(machine);
  }

  /** Business action: marks a machine as under maintenance. */
  setEnMaintenance(id: string): Observable<Machine | undefined> {
    return this.update(id, { etat: EtatEquipement.EN_MAINTENANCE });
  }

  setDisponible(id: string): Observable<Machine | undefined> {
    return this.update(id, { etat: EtatEquipement.DISPONIBLE });
  }
}
