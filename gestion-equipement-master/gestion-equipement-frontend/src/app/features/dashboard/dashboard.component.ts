import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MachineService } from '../../core/services/machine.service';
import { ArticleQuincaillerieService } from '../../core/services/article-quincaillerie.service';
import { ClientService } from '../../core/services/client.service';
import { LocationService } from '../../core/services/location.service';
import { VenteService } from '../../core/services/vente.service';
import { AuthService } from '../../core/services/auth.service';
import { EtatEquipement } from '../../core/models/equipement.model';
import { StatutLocation } from '../../core/models/location.model';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  template: `
    <header class="page-header">
      <div>
        <span class="eyebrow">Vue d'ensemble</span>
        <h1>Bonjour, {{ firstName() }}</h1>
      </div>
    </header>

    @if (loaded()) {
      <div class="stat-grid">
        <div class="stat-card">
          <span class="stat-value">{{ machinesDisponibles() }}</span>
          <span class="stat-label">Machines disponibles</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ locationsEnCours() }}</span>
          <span class="stat-label">Locations en cours</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ articlesRuptureStock() }}</span>
          <span class="stat-label">Articles en rupture</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ clientsCount() }}</span>
          <span class="stat-label">Clients enregistres</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ ventesCeMois() }}</span>
          <span class="stat-label">Ventes ce mois</span>
        </div>
      </div>

      <div class="card card-pad">
        <h3 class="mt-0">Locations en cours</h3>
        @if (locationsEnCoursListe().length === 0) {
          <p class="text-muted">Aucune location en cours.</p>
        } @else {
          <table>
            <thead>
              <tr><th>Client</th><th>Machine</th><th>Debut</th><th>Fin prevue</th><th>Statut</th></tr>
            </thead>
            <tbody>
              @for (loc of locationsEnCoursListe(); track loc.id) {
                <tr>
                  <td>{{ loc.clientNom }}</td>
                  <td>{{ loc.machineNom }}</td>
                  <td class="num">{{ loc.dateDebut }}</td>
                  <td class="num">{{ loc.dateFinPrevue }}</td>
                  <td><app-badge [value]="loc.statut"></app-badge></td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  loaded = signal(false);
  machinesDisponibles = signal(0);
  locationsEnCours = signal(0);
  articlesRuptureStock = signal(0);
  clientsCount = signal(0);
  ventesCeMois = signal(0);
  locationsEnCoursListe = signal<ReturnType<LocationService['getAll']>>([]);

  constructor(
    private machineService: MachineService,
    private articleService: ArticleQuincaillerieService,
    private clientService: ClientService,
    private locationService: LocationService,
    private venteService: VenteService,
    private authService: AuthService
  ) {}

  firstName(): string {
    return this.authService.user()?.nom?.split(' ')[0] ?? '';
  }

  ngOnInit(): void {
    forkJoin([
      this.machineService.load(),
      this.articleService.load(),
      this.clientService.load(),
      this.locationService.load(),
      this.venteService.load(),
    ]).subscribe(() => {
      this.machinesDisponibles.set(
        this.machineService.getAll().filter((m) => m.etat === EtatEquipement.DISPONIBLE).length
      );
      this.articlesRuptureStock.set(
        this.articleService.getAll().filter((a) => a.quantiteStock <= (a.seuilReappro ?? 0)).length
      );
      this.clientsCount.set(this.clientService.getAll().length);

      const enCours = this.locationService.getAll().filter((l) => l.statut === StatutLocation.EN_COURS);
      this.locationsEnCours.set(enCours.length);
      this.locationsEnCoursListe.set(enCours);

      const now = new Date();
      this.ventesCeMois.set(
        this.venteService
          .getAll()
          .filter((v) => {
            const d = new Date(v.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length
      );

      this.loaded.set(true);
    });
  }
}
