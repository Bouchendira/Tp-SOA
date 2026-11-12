import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiCrudService } from './api-crud.service';
import { Location } from '../models/location.model';
import { ClientService } from './client.service';
import { MachineService } from './machine.service';
import { EtatEquipement } from '../models/equipement.model';
import { tap } from 'rxjs/operators';

export interface CreateLocationInput {
  clientId: string;
  machineId: string;
  dateDebut: string;
  dateFinPrevue: string;
  caution?: number;
  fraisTransport?: number;
  modeLivraison?: Location['modeLivraison'];
}

@Injectable({ providedIn: 'root' })
export class LocationService extends ApiCrudService<Location> {
  constructor(
    http: HttpClient,
    private clientService: ClientService,
    private machineService: MachineService
  ) {
    super(http, '/api/locations-fournisseurs');
  }

  /**
   * Mirrors LocationService#create on the backend exactly, including the
   * Rental records represent equipment rented in from a supplier.
   */
  createLocation(input: CreateLocationInput): Observable<Location> {
    if (!(new Date(input.dateFinPrevue) > new Date(input.dateDebut))) {
      return throwError(() => new Error('La date de fin prevue doit etre posterieure a la date de debut'));
    }

    const client = this.clientService.getById(input.clientId);
    if (!client) {
      return throwError(() => new Error('Fournisseur introuvable'));
    }

    const machine = this.machineService.getById(input.machineId);
    if (!machine) {
      return throwError(() => new Error('Machine introuvable'));
    }

    if (machine.etat !== EtatEquipement.DISPONIBLE) {
      return throwError(
        () => new Error(`La machine "${machine.nom}" n'est pas disponible (etat actuel : ${machine.etat})`)
      );
    }

    return this.createRequest(input).pipe(
      tap(() => this.machineService.updateLocal(machine.id, { etat: EtatEquipement.LOUE }))
    );
  }

  /** Mirrors LocationService#terminerLocation on the backend. */
  terminerLocation(id: string): Observable<Location | undefined> {
    const location = this.getById(id);
    if (!location) {
      return throwError(() => new Error('Location introuvable'));
    }

    return this.postRequest(id, 'retour').pipe(
      tap(() =>
        this.machineService.updateLocal(location.machineId, { etat: EtatEquipement.RETOURNE_FOURNISSEUR })
      )
    );
  }
}
