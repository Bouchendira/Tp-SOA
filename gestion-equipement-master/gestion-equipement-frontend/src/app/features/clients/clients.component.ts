import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import { Client, TypeClient } from '../../core/models/client.model';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AuthService } from '../../core/services/auth.service';
import { RoleEmploye } from '../../core/models/employe.model';

interface ClientForm {
  nom: string; typeClient: TypeClient; matriculeFiscal: string; cin: string; telephone: string; email: string;
}

const EMPTY_FORM: ClientForm = {
  nom: '', typeClient: TypeClient.PARTICULIER, matriculeFiscal: '', cin: '', telephone: '', email: '',
};

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, BadgeComponent],
  template: `
    <header class="page-header">
      <div>
        <span class="eyebrow">Approvisionnement</span>
        <h1>Fournisseurs</h1>
      </div>
      @if (canManageStock()) {
        <button class="btn btn-primary" (click)="openCreate()">+ Nouveau fournisseur</button>
      }
    </header>

    @if (pageError()) { <p class="hint" role="alert">{{ pageError() }}</p> }

    <div class="flex-between" style="margin-bottom:14px">
      <app-search-bar [(value)]="search" placeholder="Rechercher par nom, email, MF/CIN..."></app-search-bar>
      <span class="text-muted" style="font-size:12.5px">{{ filtered().length }} resultat(s)</span>
    </div>

    <div class="table-wrap">
      @if (filtered().length === 0) {
        <div class="empty-state">
          <h3>Aucun fournisseur</h3>
          <p>Essayez un autre terme de recherche ou ajoutez-en un nouveau.</p>
        </div>
      } @else {
        <table>
          <thead>
            <tr><th>Nom</th><th>Type</th><th>MF / CIN</th><th>Contact</th><th></th></tr>
          </thead>
          <tbody>
            @for (c of filtered(); track c.id) {
              <tr>
                <td><strong>{{ c.nom }}</strong></td>
                <td><app-badge [value]="c.typeClient"></app-badge></td>
                <td class="mono">{{ c.matriculeFiscal || c.cin || '-' }}</td>
                <td>
                  <div>{{ c.telephone }}</div>
                  <div class="text-muted" style="font-size:12px">{{ c.email }}</div>
                </td>
                <td class="row-actions">
                  @if (canManageStock()) {
                    <button class="btn btn-sm" (click)="openEdit(c)">Modifier</button>
                    <button class="btn btn-sm btn-danger" (click)="remove(c)">Supprimer</button>
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
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="mt-0">{{ editing() ? 'Modifier le fournisseur' : 'Nouveau fournisseur' }}</h3>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label>Type de fournisseur</label>
              <select [(ngModel)]="form.typeClient" name="typeClient">
                <option [value]="'PARTICULIER'">Particulier</option>
                <option [value]="'ENTREPRISE'">Entreprise</option>
              </select>
            </div>
            <div class="field">
              <label>Nom {{ form.typeClient === 'ENTREPRISE' ? '(raison sociale)' : '' }}</label>
              <input [(ngModel)]="form.nom" name="nom" />
            </div>
            @if (form.typeClient === 'ENTREPRISE') {
              <div class="field">
                <label>Matricule fiscal</label>
                <input [(ngModel)]="form.matriculeFiscal" name="matriculeFiscal" placeholder="1234567A" />
              </div>
            } @else {
              <div class="field">
                <label>CIN</label>
                <input [(ngModel)]="form.cin" name="cin" />
              </div>
            }
            <div class="form-grid">
              <div class="field">
                <label>Telephone</label>
                <input [(ngModel)]="form.telephone" name="telephone" />
              </div>
              <div class="field">
                <label>Email</label>
                <input type="email" [(ngModel)]="form.email" name="email" />
              </div>
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
export class ClientsComponent implements OnInit {
  search = '';
  clients = signal<Client[]>([]);
  modalOpen = signal(false);
  editing = signal<Client | null>(null);
  error = signal<string | null>(null);
  pageError = signal<string | null>(null);
  form: ClientForm = { ...EMPTY_FORM };

  filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    const list = this.clients();
    if (!term) return list;
    return list.filter(
      (c) =>
        c.nom.toLowerCase().includes(term) ||
        (c.email ?? '').toLowerCase().includes(term) ||
        (c.matriculeFiscal ?? '').toLowerCase().includes(term) ||
        (c.cin ?? '').toLowerCase().includes(term)
    );
  });

  constructor(private clientService: ClientService, private authService: AuthService) {}

  canManageStock(): boolean {
    return this.authService.hasRole(RoleEmploye.ADMINISTRATEUR, RoleEmploye.MAGASINIER);
  }

  ngOnInit(): void {
    this.clientService.load().subscribe({
      error: (err: Error) => this.pageError.set(err.message),
    });
    this.clientService.data$.subscribe((data) => this.clients.set(data));
  }

  openCreate(): void {
    this.editing.set(null);
    this.form = { ...EMPTY_FORM };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  openEdit(c: Client): void {
    this.editing.set(c);
    this.form = {
      nom: c.nom, typeClient: c.typeClient, matriculeFiscal: c.matriculeFiscal ?? '',
      cin: c.cin ?? '', telephone: c.telephone ?? '', email: c.email ?? '',
    };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    this.error.set(null);
    const editing = this.editing();
    const action = editing
      ? this.clientService.updateClient(editing.id, this.form)
      : this.clientService.createClient(this.form);

    action.subscribe({
      next: () => this.closeModal(),
      error: (err: Error) => this.error.set(err.message),
    });
  }

  remove(c: Client): void {
    if (confirm(`Supprimer le client "${c.nom}" ?`)) {
      this.clientService.delete(c.id).subscribe({
        error: (err: Error) => this.pageError.set(err.message),
      });
    }
  }
}
