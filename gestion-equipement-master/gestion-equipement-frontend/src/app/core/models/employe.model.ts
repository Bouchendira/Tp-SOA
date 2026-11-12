export enum RoleEmploye {
  ADMINISTRATEUR = 'ADMINISTRATEUR',
  MAGASINIER = 'MAGASINIER',
  AGENT = 'AGENT',
  COMPTABLE = 'COMPTABLE',
}

export interface Employe {
  id: string;
  nom: string;
  cin: string;
  email: string;
  telephone?: string;
  role: RoleEmploye;
  motDePasse?: string;
}
