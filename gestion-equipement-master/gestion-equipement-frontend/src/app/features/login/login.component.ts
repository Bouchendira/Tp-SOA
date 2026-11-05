import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-brand">
          <span class="brand-mark">QM</span>
          <div>
            <div class="brand-name">Quincaillerie</div>
            <div class="brand-sub">&amp; Machinerie</div>
          </div>
        </div>

        <h1>Connexion</h1>
        <p class="text-muted mt-0">Accedez a votre espace de gestion.</p>

        <form (ngSubmit)="submit()">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="prenom.nom@quincaillerie.tn" required />
          </div>
          <div class="field">
            <label for="password">Mot de passe</label>
            <input id="password" type="password" [(ngModel)]="password" name="password" placeholder="********" required />
          </div>

          @if (error()) {
            <p class="hint">{{ error() }}</p>
          }

          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" [disabled]="loading()">
            {{ loading() ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div class="demo-accounts">
          <div class="demo-title">Comptes de demonstration (prototype)</div>
          <ul>
            <li><span class="mono">admin&#64;quincaillerie.tn</span> - Administrateur</li>
            <li><span class="mono">magasinier&#64;quincaillerie.tn</span> - Magasinier</li>
            <li><span class="mono">agent&#64;quincaillerie.tn</span> - Agent</li>
            <li><span class="mono">comptable&#64;quincaillerie.tn</span> - Comptable</li>
          </ul>
          <div class="text-muted" style="font-size:12px">Mot de passe pour tous : <span class="mono">Password123!</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-screen {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: var(--ink);
      background-image: linear-gradient(160deg, var(--ink) 0%, #2a323b 100%);
      padding: 20px;
    }
    .login-card {
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow-2);
      width: 100%;
      max-width: 400px;
      padding: 32px 32px 24px;
    }
    .login-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
    .brand-mark {
      background: var(--accent); color: #fff;
      font-family: var(--font-display); font-weight: 700; font-size: 16px;
      width: 38px; height: 38px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 4px;
    }
    .brand-name { font-family: var(--font-display); text-transform: uppercase; font-size: 16px; line-height: 1.1; }
    .brand-sub { font-size: 11px; color: var(--muted); }
    .demo-accounts {
      margin-top: 22px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .demo-title {
      font-family: var(--font-mono); font-size: 10.5px;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--muted); margin-bottom: 8px;
    }
    .demo-accounts ul { list-style: none; padding: 0; margin: 0 0 8px; font-size: 12.5px; }
    .demo-accounts li { padding: 2px 0; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error.set(null);
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message);
      },
    });
  }
}
