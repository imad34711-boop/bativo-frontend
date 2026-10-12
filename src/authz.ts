import type { Profil } from './api/types';

export function aLeRole(profil: Profil, role: string): boolean {
  return profil.roles.includes(role);
}

export function aLaPermission(profil: Profil, permission: string): boolean {
  return profil.permissions.includes(permission);
}

export function estSuperAdmin(profil: Profil): boolean {
  return aLeRole(profil, 'ROLE_ADMIN');
}

export function peutVoirAdministration(profil: Profil): boolean {
  return estSuperAdmin(profil);
}
