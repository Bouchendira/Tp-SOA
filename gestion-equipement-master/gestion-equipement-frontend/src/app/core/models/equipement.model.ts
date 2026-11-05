export enum EtatEquipement {
  DISPONIBLE = 'DISPONIBLE',
  LOUE = 'LOUE',
  VENDU = 'VENDU',
  EN_MAINTENANCE = 'EN_MAINTENANCE',
  AFFECTE = 'AFFECTE',
  RETIRE = 'RETIRE',
}

export interface EquipementBase {
  id: string;
  nom: string;
  description?: string;
  marque?: string;
  modele?: string;
  prixVenteHT: number;
  tauxTVA: number;
  etat: EtatEquipement;
  categorieId: string;
  categorieNom?: string;
}

export interface Machine extends EquipementBase {
  numeroSerie?: string;
  prixLocationJourHT?: number;
  dateAcquisition?: string;
  intervalleMaintenanceJours?: number;
  caution?: number;
}

export interface ArticleQuincaillerie extends EquipementBase {
  quantiteStock: number;
  unite?: string;
  seuilReappro?: number;
  codeBarre?: string;
}
