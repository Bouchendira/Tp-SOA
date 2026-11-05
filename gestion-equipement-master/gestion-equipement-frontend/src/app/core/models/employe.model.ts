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
  /**
   * PROTOTYPE ONLY. The real backend never returns a password (hashed or
   * otherwise) in an API response - see EmployeResponseDTO. This field
   * exists purely so the mock AuthService can simulate a login screen
   * against local JSON data before the real /api/auth/login exists on
   * the frontend. Remove this field entirely once wired to the backend.
   */
  motDePasse?: string;
}
