export enum TypeClient {
  PARTICULIER = 'PARTICULIER',
  ENTREPRISE = 'ENTREPRISE',
}

export interface Client {
  id: string;
  nom: string;
  typeClient: TypeClient;
  matriculeFiscal?: string;
  cin?: string;
  telephone?: string;
  email?: string;
}
