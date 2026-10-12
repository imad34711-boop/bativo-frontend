import { useState, type FormEvent } from 'react';
import { ouvrirSession } from '../api/bativo';
import { decrireErreur } from '../api/client';
import type { Session } from '../api/types';
import Card from './ui/Card';
import Button from './ui/Button';
import { inputClass } from './ui/Field';

interface Props {
  onConnecte: (session: Session) => void;
}

export default function FormulaireConnexion({ onConnecte }: Props) {
  const [email, setEmail] = useState('admin@bativo.local');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    try {
      onConnecte(await ouvrirSession(email, motDePasse));
    } catch (cause) {
      setErreur(decrireErreur(cause));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md !p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-md shadow-blue-600/25">
          B
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Connexion</h2>
          <p className="text-sm text-slate-500">Accedez a votre espace Bativo</p>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={soumettre}>
        <label className="grid gap-1.5 text-sm font-medium text-slate-600">
          Adresse e-mail
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-600">
          Mot de passe
          <input
            type="password"
            className={inputClass}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {erreur && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
            {erreur}
          </p>
        )}

        <Button type="submit" disabled={enCours} className="mt-2 w-full">
          {enCours ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </Card>
  );
}
