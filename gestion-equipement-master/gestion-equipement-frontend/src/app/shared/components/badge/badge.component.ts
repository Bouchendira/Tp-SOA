import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Generic colored badge for statuses/roles/etats across the app.
 * Pass any string value; the color mapping falls back to neutral
 * for values it doesn't recognize.
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [style.background]="bg()" [style.color]="fg()">{{ label() }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 3px;
      white-space: nowrap;
    }
  `]
})
export class BadgeComponent {
  private valueSig = signal<string>('');
  @Input() set value(v: string) { this.valueSig.set(v ?? ''); }

  label = computed(() => this.valueSig().replace(/_/g, ' '));

  private palette: Record<string, { bg: string; fg: string }> = {
    DISPONIBLE: { bg: 'var(--ok-soft)', fg: 'var(--ok)' },
    A_COMMANDER: { bg: 'var(--warn-soft)', fg: 'var(--warn)' },
    EN_COURS: { bg: 'var(--ok-soft)', fg: 'var(--ok)' },
    ADMINISTRATEUR: { bg: 'var(--accent-soft)', fg: 'var(--accent)' },
    LOUE: { bg: 'var(--warn-soft)', fg: 'var(--warn)' },
    AFFECTE: { bg: 'var(--warn-soft)', fg: 'var(--warn)' },
    EN_MAINTENANCE: { bg: 'var(--warn-soft)', fg: 'var(--warn)' },
    VENDU: { bg: 'var(--neutral-soft)', fg: 'var(--ink-soft)' },
    TERMINEE: { bg: 'var(--neutral-soft)', fg: 'var(--ink-soft)' },
    RETIRE: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
    RETOURNE_FOURNISSEUR: { bg: 'var(--neutral-soft)', fg: 'var(--ink-soft)' },
    ANNULEE: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
  };

  bg = computed(() => this.palette[this.valueSig()]?.bg ?? 'var(--neutral-soft)');
  fg = computed(() => this.palette[this.valueSig()]?.fg ?? 'var(--ink-soft)');
}
