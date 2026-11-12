import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MachineService } from '../../core/services/machine.service';
import { CategorieService } from '../../core/services/categorie.service';
import { Machine, EtatEquipement } from '../../core/models/equipement.model';
import { AuthService } from '../../core/services/auth.service';
import { RoleEmploye } from '../../core/models/employe.model';
import { Categorie } from '../../core/models/categorie.model';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

interface MachineForm {
  nom: string;
  description: string;
  marque: string;
  modele: string;
  prixVenteHT: number | null;
  tauxTVA: number | null;
  categorieId: string;
  numeroSerie: string;
  prixLocationJourHT: number | null;
  dateAcquisition: string;
  intervalleMaintenanceJours: number | null;
  caution: number | null;
}

const EMPTY_FORM: MachineForm = {
  nom: '', description: '', marque: '', modele: '',
  prixVenteHT: null, tauxTVA: 19, categorieId: '',
  numeroSerie: '', prixLocationJourHT: null, dateAcquisition: '',
  intervalleMaintenanceJours: null, caution: null,
};

@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, BadgeComponent],
  template: `
    <header class="page-header">
      <div>
        <span class="eyebrow">Inventaire</span>
        <h1>Equipements informatiques</h1>
      </div>
      @if (canManageStock()) {
        <button class="btn btn-primary" (click)="openCreate()">+ Nouvel equipement</button>
      }
    </header>

    <div class="flex-between" style="margin-bottom:14px">
      <app-search-bar [(value)]="search" placeholder="Rechercher par nom, marque, numero d'inventaire..."></app-search-bar>
      <span class="text-muted" style="font-size:12.5px">{{ filtered().length }} resultat(s)</span>
    </div>

    @if (stateError()) { <p class="hint">{{ stateError() }}</p> }

    <div class="table-wrap">
      @if (filtered().length === 0) {
        <div class="empty-state">
          <h3>Aucun equipement</h3>
          <p>Essayez un autre terme de recherche ou ajoutez-en un nouveau.</p>
        </div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Equipement</th><th>Categorie</th><th>N° inventaire / serie</th>
              <th>Cout location/j</th><th>Etat</th><th>Affecte a</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (m of filtered(); track m.id) {
              <tr>
                <td>
                  <strong>{{ m.nom }}</strong>
                  <div class="text-muted" style="font-size:12px">{{ m.marque }} {{ m.modele }}</div>
                </td>
                <td>{{ m.categorieNom }}</td>
                <td class="mono">{{ m.numeroSerie }}</td>
                <td class="num">{{ m.prixLocationJourHT | number:'1.2-2' }} DT</td>
                <td><app-badge [value]="m.etat"></app-badge></td>
                <td>{{ m.employeAffecteNom || '-' }}</td>
                <td class="row-actions">
                  @if (canManageStock() && m.etat === 'A_COMMANDER') {
                    <button class="btn btn-sm" (click)="changeEtat(m, 'DISPONIBLE')">Confirmer la reception</button>
                  }
                  @if (canManageStock() && m.etat === 'EN_MAINTENANCE') {
                    <button class="btn btn-sm" (click)="setDisponible(m)">Fin maintenance</button>
                  } @else if (canManageStock() && m.etat === 'DISPONIBLE') {
                    <button class="btn btn-sm" (click)="setMaintenance(m)">Maintenance</button>
                  }
                  @if (canManageStock() && canChangeState(m)) {
                    <select #stateSelect [value]="m.etat" [name]="'etat-' + m.id"
                      aria-label="Changer l'etat de l'equipement"
                      (change)="changeEtat(m, stateSelect.value, stateSelect)">
                      @for (option of etatOptions; track option.value) {
                        <option [value]="option.value">{{ option.label }}</option>
                      }
                    </select>
                  }
                  @if (isAgent() && m.etat === 'DISPONIBLE') {
                    <button class="btn btn-sm" (click)="takeOwnership(m)">Affecter a mon compte</button>
                  }
                  @if (isAgent() && isAssignedToMe(m)) {
                    <button class="btn btn-sm" (click)="returnToStock(m)">Retourner au stock</button>
                  }
                  @if (canManageStock() && m.etat === 'AFFECTE') {
                    <button class="btn btn-sm" (click)="returnToStock(m, true)">Confirmer le retour</button>
                  }
                  @if (canManageStock()) {
                    <button class="btn btn-sm" (click)="openEdit(m)">Modifier</button>
                    <button class="btn btn-sm btn-danger" (click)="remove(m)">Supprimer</button>
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
        <div class="modal" (click)="$event.stopPropagation()" style="max-width:640px">
          <div class="modal-header">
            <h3 class="mt-0">{{ editing() ? "Modifier l'equipement" : 'Nouvel equipement' }}</h3>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="field">
                <label>Nom</label>
                <input [(ngModel)]="form.nom" name="nom" />
              </div>
              <div class="field">
                <label>Categorie</label>
                <select [(ngModel)]="form.categorieId" name="categorieId">
                  <option value="" disabled>Choisir...</option>
                  @for (c of categories(); track c.id) {
                    <option [value]="c.id">{{ c.nom }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label>Marque</label>
                <input [(ngModel)]="form.marque" name="marque" />
              </div>
              <div class="field">
                <label>Modele</label>
                <input [(ngModel)]="form.modele" name="modele" />
              </div>
              <div class="field">
                <label>Numero d'inventaire / serie</label>
                <input [(ngModel)]="form.numeroSerie" name="numeroSerie" />
              </div>
              <div class="field">
                <label>Date d'acquisition</label>
                <input type="date" [(ngModel)]="form.dateAcquisition" name="dateAcquisition" />
              </div>
              <div class="field">
                <label>Prix d'achat HT</label>
                <input type="number" [(ngModel)]="form.prixVenteHT" name="prixVenteHT" />
              </div>
              <div class="field">
                <label>Taux TVA (%)</label>
                <input type="number" [(ngModel)]="form.tauxTVA" name="tauxTVA" />
              </div>
              <div class="field">
                <label>Cout de location / jour HT</label>
                <input type="number" [(ngModel)]="form.prixLocationJourHT" name="prixLocationJourHT" />
              </div>
              <div class="field">
                <label>Caution</label>
                <input type="number" [(ngModel)]="form.caution" name="caution" />
              </div>
              <div class="field">
                <label>Intervalle maintenance (jours)</label>
                <input type="number" [(ngModel)]="form.intervalleMaintenanceJours" name="intervalleMaintenanceJours" />
              </div>
            </div>
            <div class="field">
              <label>Description</label>
              <textarea [(ngModel)]="form.description" name="description" rows="2"></textarea>
            </div>
            @if (error()) { <p class="hint">{{ error() }}</p> }
            <div class="form-actions">
              <button class="btn" (click)="closeModal()">Annuler</button>
              <button class="btn btn-primary" (click)="save()">Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class MachinesComponent implements OnInit {
  readonly etatOptions = [
    { value: EtatEquipement.A_COMMANDER, label: 'A commander' },
    { value: EtatEquipement.DISPONIBLE, label: 'Disponible en stock' },
    { value: EtatEquipement.EN_MAINTENANCE, label: 'En maintenance' },
    { value: EtatEquipement.RETIRE, label: 'Retire du stock' },
  ];
  search = '';
  machines = signal<Machine[]>([]);
  categories = signal<Categorie[]>([]);
  modalOpen = signal(false);
  editing = signal<Machine | null>(null);
  error = signal<string | null>(null);
  stateError = signal<string | null>(null);
  form: MachineForm = { ...EMPTY_FORM };

  filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    const list = this.machines();
    if (!term) return list;
    return list.filter(
      (m) =>
        m.nom.toLowerCase().includes(term) ||
        (m.marque ?? '').toLowerCase().includes(term) ||
        (m.numeroSerie ?? '').toLowerCase().includes(term) ||
        (m.categorieNom ?? '').toLowerCase().includes(term)
    );
  });

  constructor(
    private machineService: MachineService,
    private categorieService: CategorieService,
    private authService: AuthService
  ) {}

  canManageStock(): boolean {
    return this.authService.hasRole(RoleEmploye.ADMINISTRATEUR, RoleEmploye.MAGASINIER);
  }

  isAgent(): boolean {
    return this.authService.hasRole(RoleEmploye.AGENT);
  }

  isAssignedToMe(machine: Machine): boolean {
    return machine.employeAffecteId === this.authService.currentUser()?.id;
  }

  canChangeState(machine: Machine): boolean {
    return machine.etat !== EtatEquipement.LOUE
      && machine.etat !== EtatEquipement.VENDU
      && machine.etat !== EtatEquipement.AFFECTE
      && machine.etat !== EtatEquipement.RETOURNE_FOURNISSEUR;
  }

  ngOnInit(): void {
    forkJoin([this.machineService.load(), this.categorieService.load()]).subscribe(() => {
      this.categories.set(this.categorieService.getAll());
    }, (err: Error) => {
      this.stateError.set(err.message);
    });
    this.machineService.data$.subscribe((data) => this.machines.set(data));
  }

  openCreate(): void {
    this.editing.set(null);
    this.form = { ...EMPTY_FORM, tauxTVA: 19 };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  openEdit(m: Machine): void {
    this.editing.set(m);
    this.form = {
      nom: m.nom, description: m.description ?? '', marque: m.marque ?? '', modele: m.modele ?? '',
      prixVenteHT: m.prixVenteHT, tauxTVA: m.tauxTVA, categorieId: m.categorieId,
      numeroSerie: m.numeroSerie ?? '', prixLocationJourHT: m.prixLocationJourHT ?? null,
      dateAcquisition: m.dateAcquisition ?? '', intervalleMaintenanceJours: m.intervalleMaintenanceJours ?? null,
      caution: m.caution ?? null,
    };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (!this.form.nom.trim() || !this.form.categorieId || this.form.prixVenteHT == null) {
      this.error.set("Nom, categorie et cout d'acquisition sont obligatoires");
      return;
    }
    const editing = this.editing();
    const payload = {
      nom: this.form.nom,
      description: this.form.description,
      marque: this.form.marque,
      modele: this.form.modele,
      prixVenteHT: this.form.prixVenteHT!,
      tauxTVA: this.form.tauxTVA ?? 19,
      categorieId: this.form.categorieId,
      numeroSerie: this.form.numeroSerie,
      prixLocationJourHT: this.form.prixLocationJourHT ?? undefined,
      dateAcquisition: this.form.dateAcquisition,
      intervalleMaintenanceJours: this.form.intervalleMaintenanceJours ?? undefined,
      caution: this.form.caution ?? undefined,
    };

    if (editing) {
      const categorie = this.categorieService.getById(payload.categorieId);
      this.machineService
        .update(editing.id, { ...payload, categorieNom: categorie?.nom })
        .subscribe({
          next: () => this.closeModal(),
          error: (err: Error) => this.error.set(err.message),
        });
    } else {
      this.machineService.createMachine(payload).subscribe({
        next: () => this.closeModal(),
        error: (err: Error) => this.error.set(err.message),
      });
    }
  }

  setMaintenance(m: Machine): void {
    this.machineService.updateEtat(m.id, EtatEquipement.EN_MAINTENANCE).subscribe({
      error: (err: Error) => this.stateError.set(err.message),
    });
  }

  setDisponible(m: Machine): void {
    this.machineService.setDisponible(m.id).subscribe({
      error: (err: Error) => this.stateError.set(err.message),
    });
  }

  takeOwnership(machine: Machine): void {
    this.stateError.set(null);
    this.machineService.prendreEnCharge(machine.id).subscribe({
      error: (err: Error) => this.stateError.set(err.message),
    });
  }

  returnToStock(machine: Machine, magasinier = false): void {
    this.stateError.set(null);
    this.machineService.retournerAuStock(machine.id, magasinier).subscribe({
      error: (err: Error) => this.stateError.set(err.message),
    });
  }

  changeEtat(machine: Machine, value: string, select?: HTMLSelectElement): void {
    const etat = this.etatOptions.find((option) => option.value === value)?.value;
    if (!etat) {
      this.stateError.set('Etat invalide');
      if (select) select.value = machine.etat;
      return;
    }

    this.stateError.set(null);
    this.machineService.updateEtat(machine.id, etat).subscribe({
      error: (err: Error) => {
        if (select) select.value = machine.etat;
        this.stateError.set(err.message);
      },
    });
  }

  remove(m: Machine): void {
    if (confirm(`Supprimer la machine "${m.nom}" ?`)) {
      this.machineService.delete(m.id).subscribe({
        error: (err: Error) => this.stateError.set(err.message),
      });
    }
  }
}
