import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  creerUserAdmin,
  listerPermissionsAdmin,
  listerRolesAdmin,
  listerUsersAdmin,
  mettreAJourPermissionsRoleAdmin,
  mettreAJourUserAdmin,
} from '../api/bativo';
import { ApiError, decrireErreur } from '../api/client';
import type { AdminPermission, AdminRole, AdminUser, Session } from '../api/types';
import SegmentTabs from './ui/SegmentTabs';
import StatePanel from './ui/StatePanel';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { inputClass } from './ui/Field';

interface Props {
  session: Session;
  onSessionExpiree: (message: string) => void;
}

const ROLE_PAR_DEFAUT = 'LECTEUR';

export default function AdminConsole({ session, onSessionExpiree }: Props) {
  const [vue, setVue] = useState<'users' | 'permissions'>('users');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [roleCodeCreation, setRoleCodeCreation] = useState(ROLE_PAR_DEFAUT);

  const gererErreur = useCallback(
    (cause: unknown) => {
      setErreur(decrireErreur(cause));
      if (cause instanceof ApiError && cause.estNonAutorise) {
        onSessionExpiree(cause.message);
      }
    },
    [onSessionExpiree],
  );

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const [permissionsChargees, rolesCharges, usersCharges] = await Promise.all([
        listerPermissionsAdmin(session.jeton),
        listerRolesAdmin(session.jeton),
        listerUsersAdmin(session.jeton),
      ]);

      setPermissions(permissionsChargees);
      setRoles(rolesCharges);
      setUsers(usersCharges);

      if (!rolesCharges.some((role) => role.code === roleCodeCreation) && rolesCharges.length > 0) {
        setRoleCodeCreation(rolesCharges[0].code);
      }
    } catch (cause) {
      gererErreur(cause);
    } finally {
      setChargement(false);
    }
  }, [gererErreur, roleCodeCreation, session.jeton]);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function creerUtilisateur() {
    setErreur(null);

    try {
      await creerUserAdmin(session.jeton, {
        email,
        nom,
        prenom: prenom || null,
        password: motDePasse,
        actif: true,
        roleCodes: [roleCodeCreation],
      });

      setEmail('');
      setNom('');
      setPrenom('');
      setMotDePasse('');
      await charger();
    } catch (cause) {
      gererErreur(cause);
    }
  }

  async function basculerActif(user: AdminUser) {
    try {
      await mettreAJourUserAdmin(session.jeton, user.id, { actif: !user.actif });
      await charger();
    } catch (cause) {
      gererErreur(cause);
    }
  }

  async function changerRolePrincipal(user: AdminUser, roleCode: string) {
    try {
      await mettreAJourUserAdmin(session.jeton, user.id, { roleCodes: [roleCode] });
      await charger();
    } catch (cause) {
      gererErreur(cause);
    }
  }

  async function synchroniserPermissionsRole(role: AdminRole, permissionCodes: string[]) {
    try {
      await mettreAJourPermissionsRoleAdmin(session.jeton, role.id, permissionCodes);
      await charger();
    } catch (cause) {
      gererErreur(cause);
    }
  }

  const permissionsParRessource = useMemo(() => {
    const map = new Map<string, AdminPermission[]>();

    for (const permission of permissions) {
      const liste = map.get(permission.ressource) ?? [];
      liste.push(permission);
      map.set(permission.ressource, liste);
    }

    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  return (
    <div className="grid gap-5">
      <Card>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">SuperAdmin</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Utilisateurs et droits</h2>
            <p className="mt-1 text-sm text-slate-500">
              Creer des comptes, activer/desactiver des users et gerer les permissions par role.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void charger()} disabled={chargement}>
            {chargement ? 'Chargement…' : 'Rafraichir'}
          </Button>
        </header>

        {erreur && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
            {erreur}
          </p>
        )}

        <div className="mt-4">
          <SegmentTabs
            ariaLabel="Navigation administration"
            value={vue}
            onChange={setVue}
            items={[
              { key: 'users', label: 'Utilisateurs' },
              { key: 'permissions', label: 'Roles et permissions' },
            ]}
          />
        </div>

        {vue === 'users' && (
          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
            <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <h3 className="text-sm font-bold text-slate-900">Creer un utilisateur</h3>
              <div className="mt-3 grid gap-3">
                <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                  Email
                  <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                  Nom
                  <input className={inputClass} value={nom} onChange={(e) => setNom(e.target.value)} />
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                  Prenom
                  <input className={inputClass} value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                  Role global
                  <select className={inputClass} value={roleCodeCreation} onChange={(e) => setRoleCodeCreation(e.target.value)}>
                    {roles.map((role) => (
                      <option key={role.id} value={role.code}>
                        {role.code} - {role.libelle}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                  Mot de passe initial
                  <input
                    className={inputClass}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    type="password"
                  />
                </label>

                <Button type="button" className="w-full" onClick={() => void creerUtilisateur()}>
                  Creer le compte
                </Button>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <h3 className="text-sm font-bold text-slate-900">Comptes ({users.length})</h3>
              {users.length === 0 ? (
                <div className="mt-3">
                  <StatePanel state="empty" title="Aucun utilisateur" description="Creez un compte pour commencer la gestion des droits." />
                </div>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nom</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Etat</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((user) => {
                        const rolePrincipal = user.roles[0] ?? '';

                        return (
                          <tr key={user.id} className="hover:bg-slate-50/70">
                            <td className="px-3 py-2.5 text-slate-700">{user.email}</td>
                            <td className="px-3 py-2.5 text-slate-600">
                              {user.nom}
                              {user.prenom ? ` ${user.prenom}` : ''}
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge tone={user.actif ? 'success' : 'neutral'}>{user.actif ? 'Actif' : 'Inactif'}</Badge>
                            </td>
                            <td className="px-3 py-2.5">
                              <select
                                className={`${inputClass} py-1.5`}
                                value={rolePrincipal}
                                onChange={(e) => void changerRolePrincipal(user, e.target.value)}
                              >
                                {roles.map((role) => (
                                  <option key={role.id} value={role.code}>
                                    {role.code}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2.5">
                              <Button variant="secondary" size="sm" onClick={() => void basculerActif(user)}>
                                {user.actif ? 'Desactiver' : 'Activer'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </Card>

      {vue === 'permissions' && (
        <Card>
          <h3 className="text-base font-bold text-slate-900">Permissions par role</h3>
          <div className="mt-4 grid gap-4">
            {roles.map((role) => {
              const codes = new Set(role.permissionCodes);

              return (
                <article key={role.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <h4 className="text-sm font-bold text-slate-900">
                    {role.code} - <span className="font-normal text-slate-500">{role.libelle}</span>
                  </h4>

                  {permissionsParRessource.map(([ressource, permissionsRessource]) => (
                    <fieldset key={ressource} className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                      <legend className="px-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {ressource}
                      </legend>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {permissionsRessource.map((permission) => {
                          const estCoche = codes.has(permission.code);

                          return (
                            <label key={permission.id} className="flex items-center gap-2 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                                checked={estCoche}
                                onChange={(e) => {
                                  const prochain = new Set(codes);
                                  if (e.target.checked) {
                                    prochain.add(permission.code);
                                  } else {
                                    prochain.delete(permission.code);
                                  }
                                  void synchroniserPermissionsRole(role, Array.from(prochain).sort());
                                }}
                              />
                              {permission.code}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </article>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
