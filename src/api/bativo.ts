import { appelApi } from './client';
import type {
  AdminPermission,
  AdminRole,
  AdminRoleInput,
  AdminRoleUpdate,
  AdminUser,
  AdminUserAssignmentInput,
  AdminUserInput,
  AdminUserUpdate,
  Depense,
  NouveauProjet,
  NouveauRevenue,
  NouvelleDepense,
  PageProjets,
  Profil,
  Organisme,
  Projet,
  ReferencesPayload,
  Revenue,
  Session,
  Synthese,
} from './types';

/**
 * Ouvre une session: echange les identifiants contre un jeton JWT,
 * puis recupere le profil et les permissions associees.
 */
export async function ouvrirSession(email: string, motDePasse: string): Promise<Session> {
  const { token } = await appelApi<{ token: string }>('/login', {
    methode: 'POST',
    corps: { email, password: motDePasse },
  });

  return { jeton: token, profil: await profilCourant(token) };
}

export function profilCourant(jeton: string): Promise<Profil> {
  return appelApi<Profil>('/me', { jeton });
}

export function chargerReferences(jeton: string): Promise<ReferencesPayload> {
  return appelApi<ReferencesPayload>('/references', { jeton });
}

export function listerProjets(jeton: string): Promise<PageProjets> {
  return appelApi<PageProjets>('/projets', { jeton });
}

export function creerProjet(jeton: string, projet: NouveauProjet): Promise<Projet> {
  return appelApi<Projet>('/projets', { methode: 'POST', corps: projet, jeton });
}

export function supprimerProjet(jeton: string, projetId: number): Promise<void> {
  return appelApi<void>(`/projets/${projetId}`, { methode: 'DELETE', jeton });
}

export function chargerSynthese(jeton: string, projetId: number): Promise<Synthese> {
  return appelApi<Synthese>(`/projets/${projetId}/synthese`, { jeton });
}

export function listerDepenses(jeton: string, projetId: number): Promise<Depense[]> {
  return appelApi<Depense[]>(`/projets/${projetId}/depenses`, { jeton });
}

export function creerDepense(jeton: string, projetId: number, depense: NouvelleDepense): Promise<Depense> {
  return appelApi<Depense>(`/projets/${projetId}/depenses`, { methode: 'POST', corps: depense, jeton });
}

export function supprimerDepense(jeton: string, depenseId: number): Promise<void> {
  return appelApi<void>(`/depenses/${depenseId}`, { methode: 'DELETE', jeton });
}

export function listerRevenues(jeton: string, projetId: number): Promise<Revenue[]> {
  return appelApi<Revenue[]>(`/projets/${projetId}/revenues`, { jeton });
}

export function creerRevenue(jeton: string, projetId: number, revenue: NouveauRevenue): Promise<Revenue> {
  return appelApi<Revenue>(`/projets/${projetId}/revenues`, { methode: 'POST', corps: revenue, jeton });
}

export function supprimerRevenue(jeton: string, revenueId: number): Promise<void> {
  return appelApi<void>(`/revenues/${revenueId}`, { methode: 'DELETE', jeton });
}

export function listerPermissionsAdmin(jeton: string): Promise<AdminPermission[]> {
  return appelApi<AdminPermission[]>('/admin/permissions', { jeton });
}

export function listerRolesAdmin(jeton: string): Promise<AdminRole[]> {
  return appelApi<AdminRole[]>('/admin/roles', { jeton });
}

export function creerRoleAdmin(jeton: string, payload: AdminRoleInput): Promise<AdminRole> {
  return appelApi<AdminRole>('/admin/roles', { methode: 'POST', corps: payload, jeton });
}

export function mettreAJourRoleAdmin(jeton: string, roleId: number, payload: AdminRoleUpdate): Promise<AdminRole> {
  return appelApi<AdminRole>(`/admin/roles/${roleId}`, { methode: 'PUT', corps: payload, jeton });
}

export function supprimerRoleAdmin(jeton: string, roleId: number): Promise<void> {
  return appelApi<void>(`/admin/roles/${roleId}`, { methode: 'DELETE', jeton });
}

export function mettreAJourPermissionsRoleAdmin(
  jeton: string,
  roleId: number,
  permissionCodes: string[],
): Promise<AdminRole> {
  return appelApi<AdminRole>(`/admin/roles/${roleId}/permissions`, {
    methode: 'PUT',
    corps: { permissionCodes },
    jeton,
  });
}

export function listerUsersAdmin(jeton: string): Promise<AdminUser[]> {
  return appelApi<AdminUser[]>('/admin/users', { jeton });
}

export function listerOrganismesAdmin(jeton: string): Promise<Organisme[]> {
  return appelApi<Organisme[]>('/admin/organismes', { jeton });
}

export function creerOrganismeAdmin(
  jeton: string,
  payload: { code: string; nom: string },
): Promise<Organisme> {
  return appelApi<Organisme>('/admin/organismes', { methode: 'POST', corps: payload, jeton });
}

export function mettreAJourOrganismeAdmin(
  jeton: string,
  organismeId: number,
  payload: { code?: string; nom?: string },
): Promise<Organisme> {
  return appelApi<Organisme>(`/admin/organismes/${organismeId}`, { methode: 'PUT', corps: payload, jeton });
}

export function creerUserAdmin(jeton: string, payload: AdminUserInput): Promise<AdminUser> {
  return appelApi<AdminUser>('/admin/users', { methode: 'POST', corps: payload, jeton });
}

export function mettreAJourUserAdmin(jeton: string, userId: number, payload: AdminUserUpdate): Promise<AdminUser> {
  return appelApi<AdminUser>(`/admin/users/${userId}`, { methode: 'PUT', corps: payload, jeton });
}

export function remplacerAssignmentsUserAdmin(
  jeton: string,
  userId: number,
  assignments: AdminUserAssignmentInput[],
): Promise<AdminUser> {
  return appelApi<AdminUser>(`/admin/users/${userId}/assignments`, {
    methode: 'PUT',
    corps: { assignments },
    jeton,
  });
}
