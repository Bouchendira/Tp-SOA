import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { MockCrudService } from './mock-crud.service';
import { Location, StatutLocation } from '../models/location.model';
import { ClientService } from './client.service';
import { MachineService } from './machine.service';
import { EtatEquipement } from '../models/equipement.model';
import { AuthService } from './auth.service';

export interface CreateLocationInput {
  clientId: string;
  machineId: string;
  dateDebut: string;
  dateFinPrevue: string;
  caution?: number;
  fraisTransport?: number;
  modeLivraison?: Location['modeLivraison'];
}

/** Placeholder rate - see chap4_realisation.tex TODO re: real penalty rule. */
const PENALITE_PAR_JOUR = 20;

@Injectable({ providedIn: 'root' })
export class LocationService extends MockCrudService<Location> {
  constructor(
    http: HttpClient,
    private clientService: ClientService,
    private machineService: MachineService,
    private authService: AuthService
  ) {
    super(http, 'assets/data/locations.json');
  }

  /**
   * Mirrors LocationService#create on the backend exactly, including the
   * order of checks from the "Agent cree une location" sequence diagram:
   * dates -> client existe -> machine existe -> machine disponible.
   */
  createLocation(input: CreateLocationInput): Observable<Location> {
    if (!(new Date(input.dateFinPrevue) > new Date(input.dateDebut))) {
      return throwError(() => new Error('La date de fin prevue doit etre posterieure a la date de debut'));
    }

    const client = this.clientService.getById(input.clientId);
    if (!client) {
      return throwError(() => new Error('Client introuvable'));
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

    const currentUser = this.authService.currentUser();

    const location: Location = {
      id: this.generateId('loc'),
      dateDebut: input.dateDebut,
      dateFinPrevue: input.dateFinPrevue,
      dateRetour: null,
      statut: StatutLocation.EN_COURS,
      caution: input.caution,
      fraisTransport: input.fraisTransport,
      modeLivraison: input.modeLivraison,
      clientId: client.id,
      clientNom: client.nom,
      machineId: machine.id,
      machineNom: machine.nom,
      employeId: currentUser?.id ?? '',
      employeNom: currentUser?.nom ?? '',
    };

    // Side effect matching the @Transactional block on the backend:
    // the machine flips to LOUE as part of the same logical operation.
    this.machineService.update(machine.id, { etat: EtatEquipement.LOUE }).subscribe();

    return this.create(location);
  }

  /** Mirrors LocationService#terminerLocation on the backend. */
  terminerLocation(id: string): Observable<Location | undefined> {
    const location = this.getById(id);
    if (!location) {
      return throwError(() => new Error('Location introuvable'));
    }

    const today = new Date();
    const finPrevue = new Date(location.dateFinPrevue);
    const joursRetard = Math.max(
      0,
      Math.ceil((today.getTime() - finPrevue.getTime()) / (1000 * 60 * 60 * 24))
    );

    this.machineService.update(location.machineId, { etat: EtatEquipement.DISPONIBLE }).subscribe();

    return this.update(id, {
      statut: StatutLocation.TERMINEE,
      dateRetour: today.toISOString().slice(0, 10),
      penaliteRetard: joursRetard > 0 ? joursRetard * PENALITE_PAR_JOUR : 0,
    });
  }
}
