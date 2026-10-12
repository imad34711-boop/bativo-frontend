/**
 * Configuration de l'application web.
 *
 * L'URL de l'API est centralisee ici: aucun autre module ne doit la reconstruire.
 * Les valeurs sont surchargeables via un fichier `.env.local` (voir `.env.example`).
 */

const API_URL_PAR_DEFAUT = 'http://127.0.0.1:8000/api';
const DELAI_PAR_DEFAUT_MS = 10000;

function nombreOuDefaut(valeur: string | undefined, defaut: number): number {
  const nombre = Number(valeur);

  return Number.isFinite(nombre) && nombre > 0 ? nombre : defaut;
}

/** URL racine de l'API, sans slash final. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  API_URL_PAR_DEFAUT
).replace(/\/+$/, '');

/** Delai au-dela duquel une requete est abandonnee. */
export const API_TIMEOUT_MS = nombreOuDefaut(import.meta.env.VITE_API_TIMEOUT_MS, DELAI_PAR_DEFAUT_MS);
