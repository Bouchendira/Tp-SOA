import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeService } from '../../core/services/employe.service';
import { Employe, RoleEmploye } from '../../core/models/employe.model';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

interface EmployeForm {
  nom: string; cin: string; email: string; telephone: string; role: RoleEmploye; motDePasse: string;
}

const EMPTY_FORM: EmployeForm = {
  nom: '', cin: '', email: '', telephone: '', role: RoleEmploye.AGENT, motDePasse: '',
};

@Component({
  selector: 'app-employes',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, BadgeComponent],
  template: `
    <header class="page-header">
      <div>
        <span class="eyebrow">Administration</span>
        <h1>Employes</h1>
      </div>
      <button class="btn btn-primary" (click)="openCreate()">+ Nouvel employe</button>
    </header>

    @if (pageError()) { <p class="hint" role="alert">{{ pageError() }}</p> }

    <div class="flex-between" style="margin-bottom:14px">
      <app-search-bar [(value)]="search" placeholder="Rechercher par nom, email, role..."></app-search-bar>
      <span class="text-muted" style="font-size:12.5px">{{ filtered().length }} resultat(s)</span>
    </div>

    <div class="table-wrap">
      @if (filtered().length === 0) {
        <div class="empty-state">
          <h3>Aucun employe</h3>
          <p>Essayez un autre terme de recherche ou ajoutez-en un nouveau.</p>
        </div>
      } @else {
        <table>
          <thead>
            <tr><th>Nom</th><th>Role</th><th>CIN</th><th>Contact</th><th></th></tr>
          </thead>
          <tbody>
            @for (e of filtered(); track e.id) {
              <tr>
                <td><strong>{{ e.nom }}</strong></td>
                <td><app-badge [value]="e.role"></app-badge></td>
                <td class="mono">{{ e.cin }}</td>
                <td>
                  <div>{{ e.telephone }}</div>
                  <div class="text-muted" style="font-size:12px">{{ e.email }}</div>
                </td>
                <td class="row-actions">
                  <button class="btn btn-sm" (click)="openEdit(e)">Modifier</button>
                  <button class="btn btn-sm btn-danger" (click)="remove(e)">Supprimer</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="mt-0">{{ editing() ? "Modifier l'employe" : 'Nouvel employe' }}</h3>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="field">
                <label>Nom</label>
                <input [(ngModel)]="form.nom" name="nom" />
              </div>
              <div class="field">
                <label>CIN</label>
                <input [(ngModel)]="form.cin" name="cin" />
              </div>
              <div class="field">
                <label>Email</label>
                <input type="email" [(ngModel)]="form.email" name="email" />
              </div>
              <div class="field">
                <label>Telephone</label>
                <input [(ngModel)]="form.telephone" name="telephone" />
              </div>
              <div class="field">
                <label>Role</label>
                <select [(ngModel)]="form.role" name="role">
                  <option value="ADMINISTRATEUR">Administrateur</option>
                  <option value="MAGASINIER">Magasinier</option>
                  <option value="AGENT">Agent</option>
                  <option value="COMPTABLE">Comptable</option>
                </select>
              </div>
              @if (!editing()) {
                <div class="field">
                  <label>Mot de passe initial</label>
                  <input type="password" [(ngModel)]="form.motDePasse" name="motDePasse" />
                </div>
              }
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
export class EmployesComponent implements OnInit {
  search = '';
  employes = signal<Employe[]>([]);
  modalOpen = signal(false);
  editing = signal<Employe | null>(null);
  error = signal<string | null>(null);
  pageError = signal<string | null>(null);
  form: EmployeForm = { ...EMPTY_FORM };

  filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    const list = this.employes();
    if (!term) return list;
    return list.filter(
      (e) =>
        e.nom.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        e.role.toLowerCase().includes(term)
    );
  });

  constructor(private employeService: EmployeService) {}

  ngOnInit(): void {
    this.employeService.load().subscribe({
      error: (err: Error) => this.pageError.set(err.message),
    });
    this.employeService.data$.subscribe((data) => this.employes.set(data));
  }

  openCreate(): void {
    this.editing.set(null);
    this.form = { ...EMPTY_FORM };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  openEdit(e: Employe): void {
    this.editing.set(e);
    this.form = { nom: e.nom, cin: e.cin, email: e.email, telephone: e.telephone ?? '', role: e.role, motDePasse: '' };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (!this.form.nom.trim() || !this.form.email.trim() || !this.form.cin.trim()) {
      this.error.set('Nom, CIN et email sont obligatoires');
      return;
    }
    const editing = this.editing();
    if (editing) {
      const { motDePasse, ...rest } = this.form;
      this.employeService.update(editing.id, rest).subscribe({
        next: () => this.closeModal(),
        error: (err: Error) => this.error.set(err.message),
      });
    } else {
      if (!this.form.motDePasse || this.form.motDePasse.length < 8) {
        this.error.set('Le mot de passe doit contenir au moins 8 caracteres');
        return;
      }
      this.employeService.createEmploye(this.form).subscribe({
        next: () => this.closeModal(),
        error: (err: Error) => this.error.set(err.message),
      });
    }
  }

  remove(e: Employe): void {
    if (confirm(`Supprimer l'employe "${e.nom}" ?`)) {
      this.employeService.delete(e.id).subscribe({
        error: (err: Error) => this.pageError.set(err.message),
      });
    }
  }
}
