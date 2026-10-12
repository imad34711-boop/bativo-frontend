import { API_BASE_URL, API_TIMEOUT_MS } from '../config';

export interface Violation {
  champ: string;
  message: string;
}

/** Reponse d'erreur renvoyee par l'API (statut HTTP connu). */
export class ApiError extends Error {
  constructor(
    readonly statut: number,
    message: string,
    readonly violations: Violation[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get estNonAutorise(): boolean {
    return this.statut === 401;
  }
}

/** L'API n'a pas repondu dans le delai imparti. */
export class DelaiDepasseError extends Error {
  constructor() {
    super(`L'API n'a pas repondu en moins de ${API_TIMEOUT_MS} ms.`);
    this.name = 'DelaiDepasseError';
  }
}

/** L'API est injoignable (serveur arrete, DNS, CORS). */
export class ReseauError extends Error {
  constructor() {
    super(`Impossible de joindre l'API sur ${API_BASE_URL}.`);
    this.name = 'ReseauError';
  }
}

interface CorpsErreur {
  message?: string;
  violations?: Violation[];
}

interface OptionsRequete {
  methode?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  corps?: unknown;
  jeton?: string | null;
}

const MESSAGES_PAR_STATUT: Record<number, string> = {
  400: 'Requete invalide.',
  401: 'Session expiree ou identifiants invalides.',
  403: 'Droits insuffisants pour cette operation.',
  404: 'Ressource introuvable.',
  422: 'Les donnees envoyees ont ete refusees.',
};

function messageDErreur(statut: number, corps: CorpsErreur | null): string {
  if (statut >= 500) {
    return "L'API a rencontre une erreur interne.";
  }

  return corps?.message ?? MESSAGES_PAR_STATUT[statut] ?? `Erreur HTTP ${statut}.`;
}

function analyserJson(texte: string): unknown {
  try {
    return JSON.parse(texte);
  } catch {
    return null;
  }
}

/**
 * Envoie une requete JSON a l'API et normalise les erreurs.
 *
 * @throws {DelaiDepasseError} au-dela du delai configure
 * @throws {ReseauError} si l'API est injoignable
 * @throws {ApiError} pour toute reponse 4xx ou 5xx
 */
export async function appelApi<T>(chemin: string, options: OptionsRequete = {}): Promise<T> {
  const { methode = 'GET', corps, jeton } = options;

  const controleur = new AbortController();
  const minuteur = window.setTimeout(() => controleur.abort(), API_TIMEOUT_MS);

  let reponse: Response;

  try {
    reponse = await fetch(`${API_BASE_URL}${chemin}`, {
      method: methode,
      headers: {
        Accept: 'application/json',
        ...(corps === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
      },
      body: corps === undefined ? undefined : JSON.stringify(corps),
      signal: controleur.signal,
    });
  } catch {
    throw controleur.signal.aborted ? new DelaiDepasseError() : new ReseauError();
  } finally {
    window.clearTimeout(minuteur);
  }

  if (reponse.status === 204) {
    return undefined as T;
  }

  const texte = await reponse.text();
  const donnees = texte === '' ? null : analyserJson(texte);

  if (!reponse.ok) {
    const corpsErreur = donnees as CorpsErreur | null;

    throw new ApiError(
      reponse.status,
      messageDErreur(reponse.status, corpsErreur),
      corpsErreur?.violations ?? [],
    );
  }

  return donnees as T;
}

/** Message lisible pour n'importe quelle erreur remontee par la couche API. */
export function decrireErreur(erreur: unknown): string {
  if (erreur instanceof ApiError && erreur.violations.length > 0) {
    return `${erreur.message} ${erreur.violations.map((v) => `${v.champ}: ${v.message}`).join(' ')}`;
  }

  if (erreur instanceof Error) {
    return erreur.message;
  }

  return 'Erreur inattendue.';
}
