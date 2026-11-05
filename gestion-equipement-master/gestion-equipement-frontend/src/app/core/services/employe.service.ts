import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MockCrudService } from './mock-crud.service';
import { Employe } from '../models/employe.model';

@Injectable({ providedIn: 'root' })
export class EmployeService extends MockCrudService<Employe> {
  constructor(http: HttpClient) {
    super(http, 'assets/data/employes.json');
  }

  createEmploye(data: Omit<Employe, 'id'>): Observable<Employe> {
    // NOTE: the real backend hashes motDePasse with BCrypt before saving
    // and never returns it. This mock simply keeps it in memory since
    // there is no real security boundary in a static prototype.
    const employe: Employe = { ...data, id: this.generateId('emp') };
    return this.create(employe);
  }
}
