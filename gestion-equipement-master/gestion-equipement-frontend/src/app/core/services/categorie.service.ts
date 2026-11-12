import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiCrudService } from './api-crud.service';
import { Categorie } from '../models/categorie.model';

@Injectable({ providedIn: 'root' })
export class CategorieService extends ApiCrudService<Categorie> {
  constructor(http: HttpClient) {
    super(http, '/api/categories');
  }

  createCategorie(data: Omit<Categorie, 'id'>): Observable<Categorie> {
    return this.create(data);
  }
}
