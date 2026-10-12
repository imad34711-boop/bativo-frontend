import { useState, type FormEvent } from 'react';
import { creerRevenue } from '../api/bativo';
import { decrireErreur } from '../api/client';
import { aujourdhui } from '../format';
import Field, { inputClass } from './ui/Field';
import Button from './ui/Button';

interface Props {
  jeton: string;
  projetId: number;
  prochainDecompte: number;
  onCree: () => void;
  onErreur: (erreur: unknown) => void;
}

export default function FormulaireRevenue({ jeton, projetId, prochainDecompte, onCree, onErreur }: Props) {
  const [date, setDate] = useState(aujourdhui());
  const [numeroDecompte, setNumeroDecompte] = useState(String(prochainDecompte));
  const [montantHt, setMontantHt] = useState('0');
  const [tauxTva, setTauxTva] = useState('20');
  const [tauxRetenueGarantie, setTauxRetenueGarantie] = useState('10');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    try {
      await creerRevenue(jeton, projetId, {
        date,
        numeroDecompte: Number(numeroDecompte),
        montantHt: Number(montantHt),
        tauxTva: Number(tauxTva),
        tauxRetenueGarantie: Number(tauxRetenueGarantie),
      });

      setNumeroDecompte(String(Number(numeroDecompte) + 1));
      setMontantHt('0');
      onCree();
    } catch (cause) {
      setErreur(decrireErreur(cause));
      onErreur(cause);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3" onSubmit={soumettre}>
      <Field label="Date">
        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} required />
      </Field>

      <Field label="Numero de decompte">
        <input
          type="number"
          min="1"
          step="1"
          className={inputClass}
          value={numeroDecompte}
          onChange={(e) => setNumeroDecompte(e.target.value)}
          required
        />
      </Field>

      <Field label="Montant HT">
        <input
          type="number"
          min="0"
          step="0.01"
          className={inputClass}
          value={montantHt}
          onChange={(e) => setMontantHt(e.target.value)}
          required
        />
      </Field>

      <Field label="TVA (%)">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          className={inputClass}
          value={tauxTva}
          onChange={(e) => setTauxTva(e.target.value)}
        />
      </Field>

      <Field label="Retenue de garantie (%)">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          className={inputClass}
          value={tauxRetenueGarantie}
          onChange={(e) => setTauxRetenueGarantie(e.target.value)}
        />
      </Field>

      {erreur && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 sm:col-span-2 lg:col-span-3">
          {erreur}
        </p>
      )}

      <Button className="sm:col-span-2 lg:col-span-3" type="submit" disabled={enCours}>
        {enCours ? 'Enregistrement…' : 'Ajouter le decompte'}
      </Button>
    </form>
  );
}
