import { useState, type FormEvent } from 'react';
import { creerProjet } from '../api/bativo';
import { decrireErreur } from '../api/client';
import type { Projet, Reference } from '../api/types';
import Field, { inputClass } from './ui/Field';
import Button from './ui/Button';

interface Props {
  jeton: string;
  statutsProjet: Reference[];
  onCree: (projet: Projet) => void;
  onErreur: (erreur: unknown) => void;
}

const STATUT_PAR_DEFAUT = 'EN_COURS';

function construireValeursInitiales(statutCode: string) {
  return {
    numeroMarche: '',
    objet: '',
    ville: '',
    montantMarcheHt: '0',
    tauxTva: '20',
    tauxRetenueGarantie: '10',
    tauxPlafondRetenueGarantie: '7',
    statutCode,
  };
}

type ValeursProjet = ReturnType<typeof construireValeursInitiales>;

export default function FormulaireProjet({ jeton, statutsProjet, onCree, onErreur }: Props) {
  const statutInitial = statutsProjet.find((statut) => statut.code === STATUT_PAR_DEFAUT)?.code ?? statutsProjet[0]?.code ?? '';
  const [valeurs, setValeurs] = useState(construireValeursInitiales(statutInitial));
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  function modifier(champ: keyof ValeursProjet, valeur: string) {
    setValeurs((precedent) => ({ ...precedent, [champ]: valeur }));
  }

  async function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    try {
      const projet = await creerProjet(jeton, {
        numeroMarche: valeurs.numeroMarche,
        objet: valeurs.objet,
        ville: valeurs.ville || null,
        montantMarcheHt: Number(valeurs.montantMarcheHt),
        tauxTva: Number(valeurs.tauxTva),
        tauxRetenueGarantie: Number(valeurs.tauxRetenueGarantie),
        tauxPlafondRetenueGarantie: Number(valeurs.tauxPlafondRetenueGarantie),
        statutCode: valeurs.statutCode,
      });

      setValeurs(construireValeursInitiales(statutInitial));
      onCree(projet);
    } catch (cause) {
      setErreur(decrireErreur(cause));
      onErreur(cause);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3" onSubmit={soumettre}>
      <Field label="Numero de marche">
        <input className={inputClass} value={valeurs.numeroMarche} onChange={(e) => modifier('numeroMarche', e.target.value)} required />
      </Field>

      <Field label="Objet" full>
        <input className={inputClass} value={valeurs.objet} onChange={(e) => modifier('objet', e.target.value)} required />
      </Field>

      <Field label="Ville">
        <input className={inputClass} value={valeurs.ville} onChange={(e) => modifier('ville', e.target.value)} />
      </Field>

      <Field label="Montant marche HT">
        <input
          type="number"
          min="0"
          step="0.01"
          className={inputClass}
          value={valeurs.montantMarcheHt}
          onChange={(e) => modifier('montantMarcheHt', e.target.value)}
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
          value={valeurs.tauxTva}
          onChange={(e) => modifier('tauxTva', e.target.value)}
        />
      </Field>

      <Field label="Retenue de garantie (%)">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          className={inputClass}
          value={valeurs.tauxRetenueGarantie}
          onChange={(e) => modifier('tauxRetenueGarantie', e.target.value)}
        />
      </Field>

      <Field label="Plafond retenue (%)">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          className={inputClass}
          value={valeurs.tauxPlafondRetenueGarantie}
          onChange={(e) => modifier('tauxPlafondRetenueGarantie', e.target.value)}
        />
      </Field>

      <Field label="Statut">
        <select className={inputClass} value={valeurs.statutCode} onChange={(e) => modifier('statutCode', e.target.value)}>
          {statutsProjet.map((statut) => (
            <option key={statut.code} value={statut.code}>
              {statut.libelle}
            </option>
          ))}
        </select>
      </Field>

      {erreur && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 sm:col-span-2 lg:col-span-3">
          {erreur}
        </p>
      )}

      <Button className="sm:col-span-2 lg:col-span-3" type="submit" disabled={enCours}>
        {enCours ? 'Creation…' : 'Creer le projet'}
      </Button>
    </form>
  );
}
