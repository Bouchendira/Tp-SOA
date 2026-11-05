import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="search-bar">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        type="text"
        [placeholder]="placeholder"
        [ngModel]="value"
        (ngModelChange)="onChange($event)"
        autocomplete="off"
      />
      @if (value) {
        <button type="button" class="clear" (click)="onChange('')" aria-label="Effacer la recherche">&times;</button>
      }
    </div>
  `,
  styles: [`
    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius);
      padding: 8px 12px;
      max-width: 320px;
      color: var(--muted);
    }
    .search-bar input {
      border: none;
      outline: none;
      flex: 1;
      font-size: 13.5px;
      color: var(--ink);
      background: transparent;
    }
    .clear {
      border: none; background: none; cursor: pointer;
      font-size: 16px; color: var(--muted); line-height: 1; padding: 0 2px;
    }
  `]
})
export class SearchBarComponent {
  @Input() value = '';
  @Input() placeholder = 'Rechercher...';
  @Output() valueChange = new EventEmitter<string>();

  onChange(v: string) {
    this.value = v;
    this.valueChange.emit(v);
  }
}
