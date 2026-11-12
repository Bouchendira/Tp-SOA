import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleEmploye } from '../../../core/models/employe.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <img class="brand-logo" src="assets/logo_isi.png" alt="Institut Superieur Informatique" />
      </div>

      <nav>
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Tableau de bord</a>
        <div class="nav-group">Inventaire</div>
        @if (canManageStock()) {
          <a routerLink="/categories" routerLinkActive="active" class="nav-link">Categories</a>
        }
        <a routerLink="/machines" routerLinkActive="active" class="nav-link">Materiel informatique</a>
        <a routerLink="/articles" routerLinkActive="active" class="nav-link">Fournitures et accessoires</a>
        @if (canReviewPurchases()) {
          <div class="nav-group">Achats et comptabilite</div>
          <a routerLink="/achats" routerLinkActive="active" class="nav-link">Suivi des achats</a>
          <a routerLink="/fournisseurs" routerLinkActive="active" class="nav-link">Fournisseurs</a>
        }
        @if (canManageStock()) {
          <div class="nav-group">Gestion du stock</div>
          <a routerLink="/locations-fournisseurs" routerLinkActive="active" class="nav-link">Locations fournisseurs</a>
        }
        @if (isAdmin()) {
          <div class="nav-group">Administration</div>
          <a routerLink="/employes" routerLinkActive="active" class="nav-link">Employes</a>
        }
      </nav>

      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-avatar">{{ initials() }}</div>
          <div>
            <div class="user-name">{{ auth.user()?.nom }}</div>
            <div class="user-role">{{ auth.user()?.role }}</div>
          </div>
        </div>
        <button class="btn btn-sm logout-btn" (click)="logout()">Deconnexion</button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      width: var(--sidebar-w);
      background: var(--navy);
      color: #fff;
      display: flex;
      flex-direction: column;
      padding: 20px 0;
    }
    .brand {
      display: flex; align-items: center; gap: 10px;
      padding: 0 18px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 12px;
    }
    .brand-logo { display: block; width: 100%; max-width: 190px; height: auto; }
    nav { display: flex; flex-direction: column; padding: 0 12px; flex: 1; }
    .nav-group {
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
      padding: 16px 10px 6px;
    }
    .nav-link {
      color: rgba(255,255,255,0.8);
      padding: 9px 10px;
      border-radius: var(--radius);
      font-size: 13.5px;
      font-weight: 500;
    }
    .nav-link:hover { background: rgba(255,255,255,0.06); text-decoration: none; }
    .nav-link.active { background: var(--accent); color: #fff; }
    .sidebar-footer {
      padding: 14px 16px 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin-top: 12px;
    }
    .user-chip { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .user-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255,255,255,0.12);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-mono); font-size: 12px; font-weight: 600;
    }
    .user-name { font-size: 13px; font-weight: 600; }
    .user-role {
      font-family: var(--font-mono); font-size: 10.5px;
      color: rgba(255,255,255,0.5); text-transform: uppercase;
    }
    .logout-btn {
      width: 100%;
      background: transparent;
      border-color: rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.85);
    }
    .logout-btn:hover { background: rgba(255,255,255,0.08); }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  isAdmin(): boolean {
    return this.auth.hasRole(RoleEmploye.ADMINISTRATEUR);
  }

  canManageStock(): boolean {
    return this.auth.hasRole(RoleEmploye.ADMINISTRATEUR, RoleEmploye.MAGASINIER);
  }

  canReviewPurchases(): boolean {
    return this.auth.hasRole(RoleEmploye.ADMINISTRATEUR, RoleEmploye.MAGASINIER, RoleEmploye.COMPTABLE);
  }

  initials(): string {
    const nom = this.auth.user()?.nom ?? '';
    return nom
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
