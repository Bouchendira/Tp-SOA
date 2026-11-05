import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MockCrudService } from './mock-crud.service';
import { Categorie } from '../models/categorie.model';

@Injectable({ providedIn: 'root' })
export class CategorieService extends MockCrudService<Categorie> {
  constructor(http: HttpClient) {
    super(http, 'assets/data/categories.json');
  }

  createCategorie(data: Omit<Categorie, 'id'>): Observable<Categorie> {
    const categorie: Categorie = { ...data, id: this.generateId('cat') };
    return this.create(categorie);
  }
}
