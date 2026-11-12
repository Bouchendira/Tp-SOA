import { HttpErrorResponse } from '@angular/common/http';

const FIELD_LABELS: Record<string, string> = {
  nom: 'Nom',
  cin: 'CIN',
  email: 'Adresse e-mail',
  telephone: 'Téléphone',
  role: 'Rôle',
  motDePasse: 'Mot de passe',
  categorieId: 'Categorie',
  prixVenteHT: "Prix d'achat HT",
  tauxTVA: 'Taux de TVA',
  prixLocationJourHT: 'Prix de location par jour',
  numeroSerie: 'Numéro de série',
  quantiteStock: 'Quantité en stock',
  dateDebut: 'Date de début',
  dateFinPrevue: 'Date de fin prévue',
  clientId: 'Fournisseur',
  machineId: 'Equipement',
  lignes: "Lignes de l'achat",
};

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
  }

  if (error.status === 0) {
    return 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.';
  }

  const body = isApiErrorBody(error.error) ? error.error : null;
  const details = Array.isArray(body?.details)
    ? body.details.filter((detail): detail is string => typeof detail === 'string').map(formatDetail)
    : [];
  const serverMessage = typeof body?.message === 'string' ? body.message.trim() : '';

  switch (error.status) {
    case 400:
      return details.length
        ? `Vérifiez les informations saisies : ${details.join('; ')}.`
        : serverMessage || 'Certaines informations sont invalides. Vérifiez le formulaire.';
    case 401:
      if (error.url?.endsWith('/api/auth/login')) {
        return serverMessage || 'Adresse e-mail ou mot de passe incorrect.';
      }
      return 'Connexion refusée ou session expirée. Vérifiez vos identifiants ou reconnectez-vous.';
    case 403:
      return "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
    case 404:
      return serverMessage || 'La ressource demandée est introuvable. Actualisez la page et réessayez.';
    case 409:
      return serverMessage || 'Cette action entre en conflit avec les données existantes. Vérifiez les valeurs saisies.';
    case 405:
      return "Cette action n'est pas disponible pour cette ressource.";
    default:
      if (error.status >= 500) {
        return 'Le serveur a rencontré un problème. Réessayez dans quelques instants.';
      }
      return serverMessage || "La demande n'a pas pu être effectuée. Réessayez.";
  }
}

function isApiErrorBody(value: unknown): value is { message?: unknown; details?: unknown } {
  return typeof value === 'object' && value !== null;
}

function formatDetail(detail: string): string {
  const separator = detail.indexOf(':');
  if (separator === -1) {
    return detail;
  }

  const field = detail.slice(0, separator).trim();
  const message = detail.slice(separator + 1).trim();
  const label = FIELD_LABELS[field] ?? field;
  return `${label} : ${message}`;
}
