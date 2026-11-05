import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../core/services/categorie.service';
import { Categorie } from '../../core/models/categorie.model';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent],
  template: `
    <header class="page-header">
      <div>
        <span class="eyebrow">Inventaire</span>
        <h1>Categories</h1>
      </div>
      <button class="btn btn-primary" (click)="openCreate()">+ Nouvelle categorie</button>
    </header>

    <div class="flex-between" style="margin-bottom:14px">
      <app-search-bar [(value)]="search" placeholder="Rechercher une categorie..."></app-search-bar>
      <span class="text-muted" style="font-size:12.5px">{{ filtered().length }} resultat(s)</span>
    </div>

    <div class="table-wrap">
      @if (filtered().length === 0) {
        <div class="empty-state">
          <h3>Aucune categorie</h3>
          <p>Essayez un autre terme de recherche ou creez-en une nouvelle.</p>
        </div>
      } @else {
        <table>
          <thead>
            <tr><th>Nom</th><th>Description</th><th></th></tr>
          </thead>
          <tbody>
            @for (cat of filtered(); track cat.id) {
              <tr>
                <td><strong>{{ cat.nom }}</strong></td>
                <td class="text-muted">{{ cat.description || '-' }}</td>
                <td class="row-actions">
                  <button class="btn btn-sm" (click)="openEdit(cat)">Modifier</button>
                  <button class="btn btn-sm btn-danger" (click)="remove(cat)">Supprimer</button>
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
            <h3 class="mt-0">{{ editing() ? 'Modifier la categorie' : 'Nouvelle categorie' }}</h3>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label>Nom</label>
              <input [(ngModel)]="form.nom" name="nom" placeholder="Ex: Outillage electrique" />
            </div>
            <div class="field">
              <label>Description</label>
              <textarea [(ngModel)]="form.description" name="description" rows="3"></textarea>
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
export class CategoriesComponent implements OnInit {
  search = '';
  categories = signal<Categorie[]>([]);
  modalOpen = signal(false);
  editing = signal<Categorie | null>(null);
  error = signal<string | null>(null);
  form: { nom: string; description: string } = { nom: '', description: '' };

  filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    const list = this.categories();
    if (!term) return list;
    return list.filter(
      (c) => c.nom.toLowerCase().includes(term) || (c.description ?? '').toLowerCase().includes(term)
    );
  });

  constructor(private categorieService: CategorieService) {}

  ngOnInit(): void {
    this.categorieService.load().subscribe(() => this.categories.set(this.categorieService.getAll()));
    this.categorieService.data$.subscribe((data) => this.categories.set(data));
  }

  openCreate(): void {
    this.editing.set(null);
    this.form = { nom: '', description: '' };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  openEdit(cat: Categorie): void {
    this.editing.set(cat);
    this.form = { nom: cat.nom, description: cat.description ?? '' };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (!this.form.nom.trim()) {
      this.error.set('Le nom est obligatoire');
      return;
    }
    const editing = this.editing();
    if (editing) {
      this.categorieService.update(editing.id, this.form).subscribe(() => this.closeModal());
    } else {
      this.categorieService.createCategorie(this.form).subscribe(() => this.closeModal());
    }
  }

  remove(cat: Categorie): void {
    if (confirm(`Supprimer la categorie "${cat.nom}" ?`)) {
      this.categorieService.delete(cat.id).subscribe();
    }
  }
}
