export enum ModePaiement {
  ESPECES = 'ESPECES',
  CHEQUE = 'CHEQUE',
  VIREMENT = 'VIREMENT',
  CARTE = 'CARTE',
}

export interface LigneVente {
  id: string;
  equipementId: string;
  equipementNom?: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
}

export interface Vente {
  id: string;
  date: string;
  clientId: string;
  clientNom?: string;
  employeId: string;
  employeNom?: string;
  modePaiement: ModePaiement;
  fraisTransport?: number;
  lignes: LigneVente[];
  montantTotalHT: number;
  montantTotalTVA: number;
  montantTotalTTC: number;
}
