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
          <img class="brand-logo" src="assets/logo_isi.png" alt="Institut Superieur Informatique" />
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

      </div>
    </div>
  `,
  styles: [`
    .login-screen {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg);
      background-image: linear-gradient(135deg, #eaf2f8 0%, #ffffff 58%, #e8f4ee 100%);
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
    .login-brand { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
    .brand-logo { display: block; width: 100%; max-width: 250px; height: auto; }
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
