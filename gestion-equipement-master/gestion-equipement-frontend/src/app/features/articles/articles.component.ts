import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ArticleQuincaillerieService } from '../../core/services/article-quincaillerie.service';
import { CategorieService } from '../../core/services/categorie.service';
import { ArticleQuincaillerie } from '../../core/models/equipement.model';
import { Categorie } from '../../core/models/categorie.model';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AuthService } from '../../core/services/auth.service';
import { RoleEmploye } from '../../core/models/employe.model';

interface ArticleForm {
  nom: string; description: string; marque: string;
  prixVenteHT: number | null; tauxTVA: number | null; categorieId: string;
  quantiteStock: number | null; unite: string; seuilReappro: number | null; codeBarre: string;
}

const EMPTY_FORM: ArticleForm = {
  nom: '', description: '', marque: '', prixVenteHT: null, tauxTVA: 19, categorieId: '',
  quantiteStock: null, unite: '', seuilReappro: null, codeBarre: '',
};

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, BadgeComponent],
  template: `
    <header class="page-header">
      <div>
        <span class="eyebrow">Inventaire</span>
        <h1>Fournitures et accessoires informatiques</h1>
      </div>
      @if (canManageStock()) {
        <button class="btn btn-primary" (click)="openCreate()">+ Nouvelle fourniture</button>
      }
    </header>

    @if (pageError()) { <p class="hint" role="alert">{{ pageError() }}</p> }

    <div class="flex-between" style="margin-bottom:14px">
      <app-search-bar [(value)]="search" placeholder="Rechercher par nom, code-barre..."></app-search-bar>
      <span class="text-muted" style="font-size:12.5px">{{ filtered().length }} resultat(s)</span>
    </div>

    <div class="table-wrap">
      @if (filtered().length === 0) {
        <div class="empty-state">
          <h3>Aucune fourniture</h3>
          <p>Essayez un autre terme de recherche ou ajoutez-en un nouveau.</p>
        </div>
      } @else {
        <table>
          <thead>
            <tr><th>Nom</th><th>Categorie</th><th>Stock</th><th>Prix achat HT</th><th>Etat</th><th></th></tr>
          </thead>
          <tbody>
            @for (a of filtered(); track a.id) {
              <tr>
                <td>
                  <strong>{{ a.nom }}</strong>
                  <div class="text-muted mono" style="font-size:11.5px">{{ a.codeBarre }}</div>
                </td>
                <td>{{ a.categorieNom }}</td>
                <td class="num">
                  {{ a.quantiteStock }} {{ a.unite }}
                  @if (a.quantiteStock <= (a.seuilReappro ?? 0)) {
                    <span class="hint" style="display:block;font-size:11px">stock bas</span>
                  }
                </td>
                <td class="num">{{ a.prixVenteHT | number:'1.2-2' }} DT</td>
                <td><app-badge [value]="a.etat"></app-badge></td>
                <td class="row-actions">
                  @if (canManageStock()) {
                    <button class="btn btn-sm" (click)="openEdit(a)">Modifier</button>
                    <button class="btn btn-sm btn-danger" (click)="remove(a)">Supprimer</button>
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
            <h3 class="mt-0">{{ editing() ? 'Modifier la fourniture' : 'Nouvelle fourniture' }}</h3>
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
                <label>Code-barre</label>
                <input [(ngModel)]="form.codeBarre" name="codeBarre" />
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
                <label>Quantite en stock</label>
                <input type="number" [(ngModel)]="form.quantiteStock" name="quantiteStock" />
              </div>
              <div class="field">
                <label>Unite</label>
                <input [(ngModel)]="form.unite" name="unite" placeholder="piece, boite, lot..." />
              </div>
              <div class="field">
                <label>Seuil de reapprovisionnement</label>
                <input type="number" [(ngModel)]="form.seuilReappro" name="seuilReappro" />
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
export class ArticlesComponent implements OnInit {
  search = '';
  articles = signal<ArticleQuincaillerie[]>([]);
  categories = signal<Categorie[]>([]);
  modalOpen = signal(false);
  editing = signal<ArticleQuincaillerie | null>(null);
  error = signal<string | null>(null);
  pageError = signal<string | null>(null);
  form: ArticleForm = { ...EMPTY_FORM };

  filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    const list = this.articles();
    if (!term) return list;
    return list.filter(
      (a) =>
        a.nom.toLowerCase().includes(term) ||
        (a.codeBarre ?? '').toLowerCase().includes(term) ||
        (a.categorieNom ?? '').toLowerCase().includes(term)
    );
  });

  constructor(
    private articleService: ArticleQuincaillerieService,
    private categorieService: CategorieService,
    private authService: AuthService
  ) {}

  canManageStock(): boolean {
    return this.authService.hasRole(RoleEmploye.ADMINISTRATEUR, RoleEmploye.MAGASINIER);
  }

  ngOnInit(): void {
    forkJoin([this.articleService.load(), this.categorieService.load()]).subscribe(() => {
      this.categories.set(this.categorieService.getAll());
    }, (err: Error) => {
      this.pageError.set(err.message);
    });
    this.articleService.data$.subscribe((data) => this.articles.set(data));
  }

  openCreate(): void {
    this.editing.set(null);
    this.form = { ...EMPTY_FORM, tauxTVA: 19 };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  openEdit(a: ArticleQuincaillerie): void {
    this.editing.set(a);
    this.form = {
      nom: a.nom, description: a.description ?? '', marque: a.marque ?? '',
      prixVenteHT: a.prixVenteHT, tauxTVA: a.tauxTVA, categorieId: a.categorieId,
      quantiteStock: a.quantiteStock, unite: a.unite ?? '', seuilReappro: a.seuilReappro ?? null,
      codeBarre: a.codeBarre ?? '',
    };
    this.error.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (!this.form.nom.trim() || !this.form.categorieId || this.form.prixVenteHT == null || this.form.quantiteStock == null) {
      this.error.set("Nom, categorie, prix d'achat et quantite sont obligatoires");
      return;
    }
    const editing = this.editing();
    const payload = {
      nom: this.form.nom, description: this.form.description, marque: this.form.marque,
      prixVenteHT: this.form.prixVenteHT!, tauxTVA: this.form.tauxTVA ?? 19, categorieId: this.form.categorieId,
      quantiteStock: this.form.quantiteStock!, unite: this.form.unite,
      seuilReappro: this.form.seuilReappro ?? undefined, codeBarre: this.form.codeBarre,
    };

    if (editing) {
      const categorie = this.categorieService.getById(payload.categorieId);
      this.articleService
        .updateArticle(editing.id, { ...payload, categorieNom: categorie?.nom })
        .subscribe({
          next: () => this.closeModal(),
          error: (err: Error) => this.error.set(err.message),
        });
    } else {
      this.articleService.createArticle(payload).subscribe({
        next: () => this.closeModal(),
        error: (err: Error) => this.error.set(err.message),
      });
    }
  }

  remove(a: ArticleQuincaillerie): void {
    if (confirm(`Supprimer l'article "${a.nom}" ?`)) {
      this.articleService.delete(a.id).subscribe({
        error: (err: Error) => this.pageError.set(err.message),
      });
    }
  }
}
