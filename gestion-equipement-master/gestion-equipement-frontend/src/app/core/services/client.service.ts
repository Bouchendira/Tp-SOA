import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiCrudService } from './api-crud.service';
import { Client, TypeClient } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService extends ApiCrudService<Client> {
  constructor(http: HttpClient) {
    super(http, '/api/fournisseurs');
  }

  /**
   * Mirrors ClientService#validateBusinessRules on the backend: this is
   * a cross-field rule (depends on typeClient AND matriculeFiscal/cin
   * together), which is why it lives here rather than as a simple
   * required-field check on the form.
   */
  private validateBusinessRules(data: Omit<Client, 'id'>): string | null {
    if (data.typeClient === TypeClient.ENTREPRISE && !data.matriculeFiscal?.trim()) {
      return 'Le matricule fiscal est obligatoire pour un fournisseur de type ENTREPRISE';
    }
    if (data.typeClient === TypeClient.PARTICULIER && !data.cin?.trim()) {
      return 'Le CIN est obligatoire pour un fournisseur de type PARTICULIER';
    }
    return null;
  }

  createClient(data: Omit<Client, 'id'>): Observable<Client> {
    const error = this.validateBusinessRules(data);
    if (error) {
      return throwError(() => new Error(error));
    }
    return this.create(data);
  }

  updateClient(id: string, data: Omit<Client, 'id'>): Observable<Client | undefined> {
    const error = this.validateBusinessRules(data);
    if (error) {
      return throwError(() => new Error(error));
    }
    return this.update(id, data);
  }
}
