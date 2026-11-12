export enum EtatEquipement {
  DISPONIBLE = 'DISPONIBLE',
  A_COMMANDER = 'A_COMMANDER',
  LOUE = 'LOUE',
  VENDU = 'VENDU',
  EN_MAINTENANCE = 'EN_MAINTENANCE',
  AFFECTE = 'AFFECTE',
  RETIRE = 'RETIRE',
  RETOURNE_FOURNISSEUR = 'RETOURNE_FOURNISSEUR',
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
  employeAffecteId?: string | null;
  employeAffecteNom?: string | null;
}

export interface ArticleQuincaillerie extends EquipementBase {
  quantiteStock: number;
  unite?: string;
  seuilReappro?: number;
  codeBarre?: string;
}
