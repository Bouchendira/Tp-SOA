import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { VenteService, CreateVenteLigneInput } from '../../core/services/vente.service';
import { ClientService } from '../../core/services/client.service';
import { MachineService } from '../../core/services/machine.service';
import { ArticleQuincaillerieService } from '../../core/services/article-quincaillerie.service';
import { Vente, ModePaiement } from '../../core/models/vente.model';
import { Client } from '../../core/models/client.model';
import { EquipementBase } from '../../core/models/equipement.model';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

interface DraftLigne extends CreateVenteLigneInput {}

@Component({
  selector: 'app-ventes',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent],
  template: `
    <header class="page-header">
      <div>
        <span class="eyebrow">Activite</span>
        <h1>Ventes</h1>
      </div>
      <button class="btn btn-primary" (click)="openCreate()">+ Nouvelle vente</button>
    </header>

    <div class="flex-between" style="margin-bottom:14px">
      <app-search-bar [(value)]="search" placeholder="Rechercher par client..."></app-search-bar>
      <span class="text-muted" style="font-size:12.5px">{{ filtered().length }} resultat(s)</span>
    </div>

    <div class="table-wrap">
      @if (filtered().length === 0) {
        <div class="empty-state">
          <h3>Aucune vente</h3>
          <p>Essayez un autre terme de recherche ou creez-en une nouvelle.</p>
        </div>
      } @else {
        <table>
          <thead>
            <tr><th>Date</th><th>Client</th><th>Lignes</th><th>Mode paiement</th><th>Total TTC</th></tr>
          </thead>
          <tbody>
            @for (v of filtered(); track v.id) {
              <tr>
                <td class="num">{{ v.date }}</td>
                <td>{{ v.clientNom }}</td>
                <td class="text-muted">{{ v.lignes.length }} article(s)</td>
                <td>{{ v.modePaiement }}</td>
                <td class="num"><strong>{{ v.montantTotalTTC | number:'1.2-2' }} DT</strong></td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()" style="max-width:680px">
          <div class="modal-header">
            <h3 class="mt-0">Nouvelle vente</h3>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="field">
                <label>Client</label>
                <select [(ngModel)]="clientId" name="clientId">
                  <option value="" disabled>Choisir...</option>
                  @for (c of clients(); track c.id) {
                    <option [value]="c.id">{{ c.nom }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label>Mode de paiement</label>
                <select [(ngModel)]="modePaiement" name="modePaiement">
                  <option value="ESPECES">Especes</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="CARTE">Carte</option>
                </select>
              </div>
              <div class="field">
                <label>Frais de transport</label>
                <input type="number" [(ngModel)]="fraisTransport" name="fraisTransport" />
              </div>
            </div>

            <h3>Articles</h3>
            <div class="field">
              <select #picker (change)="addLigne(picker.value); picker.value = ''">
                <option value="" disabled selected>Ajouter un article/machine...</option>
                @for (eq of equipementsVendables(); track eq.id) {
                  <option [value]="eq.id">{{ eq.nom }} - {{ eq.prixVenteHT }} DT HT</option>
                }
              </select>
            </div>

            @if (lignes().length > 0) {
              <table style="margin-bottom:12px">
                <thead>
                  <tr><th>Article</th><th>Qte</th><th>Prix HT</th><th>TVA</th><th></th></tr>
                </thead>
                <tbody>
                  @for (l of lignes(); track l.equipementId; let i = $index) {
                    <tr>
                      <td>{{ l.equipementNom }}</td>
                      <td style="width:80px">
                        <input type="number" min="1" [ngModel]="l.quantite" (ngModelChange)="setQuantite(i, $event)" name="qte-{{i}}" style="width:60px" />
                      </td>
                      <td class="num">{{ l.prixUnitaireHT }} DT</td>
                      <td class="num">{{ l.tauxTVA }}%</td>
                      <td><button class="btn btn-sm btn-danger" (click)="removeLigne(i)">&times;</button></td>
                    </tr>
                  }
                </tbody>
              </table>

              <div class="totals">
                <div><span>Total HT</span><strong>{{ totalHT() | number:'1.2-2' }} DT</strong></div>
                <div><span>Total TVA</span><strong>{{ totalTVA() | number:'1.2-2' }} DT</strong></div>
                <div><span>Frais transport</span><strong>{{ fraisTransport ?? 0 | number:'1.2-2' }} DT</strong></div>
                <div class="grand-total"><span>Total TTC</span><strong>{{ totalTTC() | number:'1.2-2' }} DT</strong></div>
              </div>
            }

            @if (error()) { <p class="hint">{{ error() }}</p> }
            <div class="form-actions">
              <button class="btn" (click)="closeModal()">Annuler</button>
              <button class="btn btn-primary" (click)="save()">Enregistrer la vente</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .totals {
      background: #f7f8f9;
      border-radius: var(--radius);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
    }
    .totals > div { display: flex; justify-content: space-between; }
    .totals .grand-total {
      border-top: 1px solid var(--border);
      margin-top: 4px;
      padding-top: 6px;
      font-size: 15px;
    }
  `]
})
export class VentesComponent implements OnInit {
  search = '';
  ventes = signal<Vente[]>([]);
  clients = signal<Client[]>([]);
  private catalogue = signal<EquipementBase[]>([]);

  modalOpen = signal(false);
  error = signal<string | null>(null);

  clientId = '';
  modePaiement: ModePaiement = ModePaiement.ESPECES;
  fraisTransport: number | null = null;
  lignes = signal<DraftLigne[]>([]);

  filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    const list = this.ventes();
    if (!term) return list;
    return list.filter((v) => (v.clientNom ?? '').toLowerCase().includes(term));
  });

  equipementsVendables = computed(() => {
    const chosenIds = new Set(this.lignes().map((l) => l.equipementId));
    return this.catalogue().filter((eq) => !chosenIds.has(eq.id));
  });

  totalHT = computed(() => round2(this.lignes().reduce((sum, l) => sum + l.quantite * l.prixUnitaireHT, 0)));
  totalTVA = computed(() =>
    round2(this.lignes().reduce((sum, l) => sum + l.quantite * l.prixUnitaireHT * (l.tauxTVA / 100), 0))
  );
  totalTTC = computed(() => round2(this.totalHT() + this.totalTVA() + (this.fraisTransport ?? 0)));

  constructor(
    private venteService: VenteService,
    private clientService: ClientService,
    private machineService: MachineService,
    private articleService: ArticleQuincaillerieService
  ) {}

  ngOnInit(): void {
    forkJoin([
      this.venteService.load(),
      this.clientService.load(),
      this.machineService.load(),
      this.articleService.load(),
    ]).subscribe(() => {
      this.clients.set(this.clientService.getAll());
      this.catalogue.set([...this.machineService.getAll(), ...this.articleService.getAll()]);
    });
    this.venteService.data$.subscribe((data) => this.ventes.set(data));
  }

  openCreate(): void {
    this.clientId = '';
    this.modePaiement = ModePaiement.ESPECES;
    this.fraisTransport = null;
    this.lignes.set([]);
    this.error.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  addLigne(equipementId: string): void {
    if (!equipementId) return;
    const eq = this.catalogue().find((e) => e.id === equipementId);
    if (!eq) return;
    this.lignes.set([
      ...this.lignes(),
      { equipementId: eq.id, equipementNom: eq.nom, quantite: 1, prixUnitaireHT: eq.prixVenteHT, tauxTVA: eq.tauxTVA },
    ]);
  }

  setQuantite(index: number, value: number): void {
    const next = [...this.lignes()];
    next[index] = { ...next[index], quantite: Math.max(1, Number(value) || 1) };
    this.lignes.set(next);
  }

  removeLigne(index: number): void {
    this.lignes.set(this.lignes().filter((_, i) => i !== index));
  }

  save(): void {
    if (!this.clientId) {
      this.error.set('Le client est obligatoire');
      return;
    }
    if (this.lignes().length === 0) {
      this.error.set('Ajoutez au moins un article a la vente');
      return;
    }
    this.error.set(null);
    this.venteService
      .createVente({
        clientId: this.clientId,
        modePaiement: this.modePaiement,
        fraisTransport: this.fraisTransport ?? undefined,
        lignes: this.lignes(),
      })
      .subscribe({
        next: () => this.closeModal(),
        error: (err: Error) => this.error.set(err.message),
      });
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
