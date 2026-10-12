import { useMemo, useState } from 'react';
import ConsoleProjets from './components/ConsoleProjets';
import AdminConsole from './components/AdminConsole';
import FormulaireConnexion from './components/FormulaireConnexion';
import TableauBord from './components/TableauBord';
import Button from './components/ui/Button';
import { peutVoirAdministration } from './authz';
import type { Session } from './api/types';

/**
 * Console de test de l'API: authentification JWT puis parcours des projets.
 *
 * Le jeton reste en memoire et n'est jamais ecrit dans le stockage du navigateur:
 * un rafraichissement de la page impose une nouvelle connexion.
 */
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [vueActive, setVueActive] = useState<'tableau-bord' | 'projets' | 'administration'>('tableau-bord');

  const afficherAdministration = useMemo(
    () => (session ? peutVoirAdministration(session.profil) : false),
    [session],
  );

  function terminerSession(motif: string | null) {
    setSession(null);
    setMessage(motif);
    setVueActive('tableau-bord');
  }

  const navItems: { key: typeof vueActive; label: string; icon: string }[] = [
    { key: 'tableau-bord', label: 'Tableau de bord', icon: '📊' },
    { key: 'projets', label: 'Projets', icon: '🏗️' },
    ...(afficherAdministration ? [{ key: 'administration' as const, label: 'Administration', icon: '🛡️' }] : []),
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-4 pb-12 pt-6 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">Bativo</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Workspace Projets et Administration
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Suivi financier chantier: projets, depenses et decomptes.
          </p>
        </div>

        {session && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 shadow-sm">
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white sm:flex">
              {session.profil.email.charAt(0).toUpperCase()}
            </span>
            <p className="text-sm font-semibold text-slate-700">{session.profil.email}</p>
            <Button variant="secondary" size="sm" onClick={() => terminerSession(null)}>
              Se deconnecter
            </Button>
          </div>
        )}
      </header>

      {message && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {message}
        </p>
      )}

      {!session ? (
        <div className="mt-10">
          <FormulaireConnexion
            onConnecte={(nouvelleSession) => {
              setMessage(null);
              setSession(nouvelleSession);
              setVueActive('tableau-bord');
            }}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm lg:sticky lg:top-6">
            <nav className="grid grid-cols-3 gap-2 lg:grid-cols-1">
              {navItems.map((item) => {
                const actif = vueActive === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setVueActive(item.key)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-150 ${
                      actif
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <span aria-hidden>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0">
            {vueActive === 'tableau-bord' && <TableauBord profil={session.profil} jeton={session.jeton} />}
            {vueActive === 'projets' && <ConsoleProjets session={session} onSessionExpiree={terminerSession} />}
            {vueActive === 'administration' && afficherAdministration && (
              <AdminConsole session={session} onSessionExpiree={terminerSession} />
            )}
          </section>
        </div>
      )}
    </main>
  );
}
