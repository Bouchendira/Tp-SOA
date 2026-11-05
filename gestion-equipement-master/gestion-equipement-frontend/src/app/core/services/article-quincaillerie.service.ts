import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MockCrudService } from './mock-crud.service';
import { ArticleQuincaillerie, EtatEquipement } from '../models/equipement.model';
import { CategorieService } from './categorie.service';

@Injectable({ providedIn: 'root' })
export class ArticleQuincaillerieService extends MockCrudService<ArticleQuincaillerie> {
  constructor(http: HttpClient, private categorieService: CategorieService) {
    super(http, 'assets/data/articles.json');
  }

  /**
   * Mirrors ArticleQuincaillerieService#create on the backend: etat
   * depends on stock quantity rather than being freely settable.
   */
  createArticle(data: Omit<ArticleQuincaillerie, 'id' | 'etat' | 'categorieNom'>): Observable<ArticleQuincaillerie> {
    const categorie = this.categorieService.getById(data.categorieId);
    const article: ArticleQuincaillerie = {
      ...data,
      id: this.generateId('art'),
      etat: data.quantiteStock > 0 ? EtatEquipement.DISPONIBLE : EtatEquipement.RETIRE,
      categorieNom: categorie?.nom,
    };
    return this.create(article);
  }

  updateArticle(id: string, changes: Partial<ArticleQuincaillerie>): Observable<ArticleQuincaillerie | undefined> {
    if (changes.quantiteStock !== undefined) {
      changes = {
        ...changes,
        etat: changes.quantiteStock > 0 ? EtatEquipement.DISPONIBLE : EtatEquipement.RETIRE,
      };
    }
    return this.update(id, changes);
  }
}
