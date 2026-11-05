export enum StatutLocation {
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export enum ModeLivraison {
  LIVRAISON = 'LIVRAISON',
  RETRAIT = 'RETRAIT',
}

export interface Location {
  id: string;
  dateDebut: string;
  dateFinPrevue: string;
  dateRetour?: string | null;
  statut: StatutLocation;
  caution?: number;
  penaliteRetard?: number;
  fraisTransport?: number;
  modeLivraison?: ModeLivraison;
  clientId: string;
  clientNom?: string;
  machineId: string;
  machineNom?: string;
  employeId: string;
  employeNom?: string;
}
