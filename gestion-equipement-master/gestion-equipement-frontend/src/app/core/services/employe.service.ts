import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiCrudService } from './api-crud.service';
import { Employe } from '../models/employe.model';

@Injectable({ providedIn: 'root' })
export class EmployeService extends ApiCrudService<Employe> {
  constructor(http: HttpClient) {
    super(http, '/api/employes');
  }

  createEmploye(data: Omit<Employe, 'id'>): Observable<Employe> {
    return this.create(data);
  }
}
