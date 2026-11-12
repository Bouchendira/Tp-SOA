import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { LocationService } from '../../core/services/location.service';
import { ClientService } from '../../core/services/client.service';
import { MachineService } from '../../core/services/machine.service';
import { Location, ModeLivraison } from '../../core/models/location.model';
import { Client } from '../../core/models/client.model';
import { Machine, EtatEquipement } from '../../core/models/equipement.model';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

interface LocationForm {
  clientId: string; machineId: string; dateDebut: string; dateFinPrevue: string;
  caution: number | null; fraisTransport: number | null; modeLivraison: ModeLivraison;
}

const EMPTY_FORM: LocationForm = {
  clientId: '', machineId: '', dateDebut: '', dateFinPrevue: '',
  caution: null, fraisTransport: null, modeLivraison: ModeLivraison.RETRAIT,
};

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, BadgeComponent],
  template: `
    <header class="page-header">
      <div>
        <span class="eyebrow">Approvisionnement</span>
        <h1>Locations fournisseurs</h1>
      </div>
      <button class="btn btn-primary" (click)="openCreate()">+ Nouvelle location</button>
    </header>

    @if (pageError()) { <p class="hint" role="alert">{{ pageError() }}</p> }

    <div class="flex-between" style="margin-bottom:14px">
      <app-search-bar [(value)]="search" placeholder="Rechercher par fournisseur, machine..."></app-search-bar>
      <span class="text-muted" style="font-size:12.5px">{{ filtered().length }} resultat(s)</span>
    </div>

    <div class="table-wrap">
      @if (filtered().length === 0) {
        <div class="empty-state">
          <h3>Aucune location</h3>
          <p>Essayez un autre terme de recherche ou creez-en une nouvelle.</p>
        </div>
      } @else {
        <table>
          <thead>
            <tr><th>Fournisseur</th><th>Equipement</th><th>Debut</th><th>Fin prevue</th><th>Retour fournisseur</th><th>Statut</th><th></th></tr>
          </thead>
          <tbody>
            @for (loc of filtered(); track loc.id) {
              <tr>
                <td>{{ loc.clientNom }}</td>
                <td>{{ loc.machineNom }}</td>
                <td class="num">{{ loc.dateDebut }}</td>
                <td class="num">{{ loc.dateFinPrevue }}</td>
                <td class="num">{{ loc.dateRetour || '-' }}</td>
                <td><app-badge [value]="loc.statut"></app-badge></td>
                <td class="row-actions">
                  @if (loc.statut === 'EN_COURS') {
                    <button class="btn btn-sm" (click)="retour(loc)">Retourner au fournisseur</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()" style="max-width:600px">
          <div class="modal-header">
            <h3 class="mt-0">Nouvelle location</h3>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="field">
                <label>Fournisseur</label>
                <select [(ngModel)]="form.clientId" name="clientId">
                  <option value="" disabled>Choisir...</option>
                  @for (f of clients(); track f.id) {
                    <option [value]="f.id">{{ f.nom }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label>Equipement disponible a louer</label>
                <select [(ngModel)]="form.machineId" name="machineId">
                  <option value="" disabled>Choisir...</option>
                  @for (m of machinesDisponibles(); track m.id) {
                    <option [value]="m.id">{{ m.nom }} ({{ m.prixLocationJourHT }} DT/j)</option>
                  }
                </select>
                @if (machinesDisponibles().length === 0) {
                  <span class="hint">Aucun equipement disponible actuellement</span>
                }
              </div>
              <div class="field">
                <label>Date de debut</label>
                <input type="date" [(ngModel)]="form.dateDebut" name="dateDebut" />
              </div>
              <div class="field">
                <label>Date de fin prevue</label>
                <input type="date" [(ngModel)]="form.dateFinPrevue" name="dateFinPrevue" />
              </div>
              <div class="field">
                <label>Caution</label>
                <input type="number" [(ngModel)]="form.caution" name="caution" />
              </div>
              <div class="field">
                <label>Frais de transport</label>
                <input type="number" [(ngModel)]="form.fraisTransport" name="fraisTransport" />
              </div>
              <div class="field">
                <label>Mode de livraison</label>
                <select [(ngModel)]="form.modeLivraison" name="modeLivraison">
                  <option value="RETRAIT">Retrait en magasin</option>
                  <option value="LIVRAISON">Livraison</option>
                </select>
              </div>
            </div>
            @if (error()) { <p class="hint">{{ error() }}</p> }
            <div class="form-actions">
              <button class="btn" (click)="closeModal()">Annuler</button>
              <button class="btn btn-primary" (click)="save()">Creer la location</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class LocationsComponent implements OnInit {
  search = '';
  locations = signal<Location[]>([]);
  clients = signal<Client[]>([]);
  machines = signal<Machine[]>([]);
  modalOpen = signal(false);
  error = signal<string | null>(null);
  pageError = signal<string | null>(null);
  form: LocationForm = { ...EMPTY_FORM };

  filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    const list = this.locations();
    if (!term) return list;
    return list.filter(
      (l) => (l.clientNom ?? '').toLowerCase().includes(term) || (l.machineNom ?? '').toLowerCase().includes(term)
    );
  });

  machinesDisponibles = computed(() => this.machines().filter((m) => m.etat === EtatEquipement.DISPONIBLE));

  constructor(
    private locationService: LocationService,
    private clientService: ClientService,
    private machineService: MachineService
  ) {}

  ngOnInit(): void {
    forkJoin([this.locationService.load(), this.clientService.load(), this.machineService.load()]).subscribe(() => {
      this.clients.set(this.clientService.getAll());
    }, (err: Error) => {
      this.pageError.set(err.message);
    });
    this.locationService.data$.subscribe((data) => this.locations.set(data));
    this.machineService.data$.subscribe((data) => this.machines.set(data));
  }

  openCreate(): void {
    this.form = { ...EMPTY_FORM };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (!this.form.clientId || !this.form.machineId || !this.form.dateDebut || !this.form.dateFinPrevue) {
      this.error.set('Fournisseur, machine et dates sont obligatoires');
      return;
    }
    this.error.set(null);
    this.locationService
      .createLocation({
        clientId: this.form.clientId,
        machineId: this.form.machineId,
        dateDebut: this.form.dateDebut,
        dateFinPrevue: this.form.dateFinPrevue,
        caution: this.form.caution ?? undefined,
        fraisTransport: this.form.fraisTransport ?? undefined,
        modeLivraison: this.form.modeLivraison,
      })
      .subscribe({
        next: () => this.closeModal(),
        error: (err: Error) => this.error.set(err.message),
      });
  }

  retour(loc: Location): void {
    if (confirm(`Confirmer le retour de "${loc.machineNom}" au fournisseur aujourd'hui ?`)) {
      this.locationService.terminerLocation(loc.id).subscribe({
        error: (err: Error) => this.pageError.set(err.message),
      });
    }
  }
}
