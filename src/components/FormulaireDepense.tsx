import { useMemo, useState, type FormEvent } from 'react';
import { creerDepense } from '../api/bativo';
import { decrireErreur } from '../api/client';
import type { Reference, ReferenceTypeFrais } from '../api/types';
import { aujourdhui } from '../format';
import Field, { inputClass } from './ui/Field';
import Button from './ui/Button';

const TYPE_PAR_DEFAUT = 'DIRECT';
const CATEGORIE_PAR_DEFAUT = 'MATERIAUX';

function trouverTypeInitial(typesFrais: ReferenceTypeFrais[]): string {
  return typesFrais.find((type) => type.code === TYPE_PAR_DEFAUT)?.code ?? typesFrais[0]?.code ?? '';
}

function trouverCategorieInitiale(typeCode: string, typesFrais: ReferenceTypeFrais[], categories: Reference[]): string {
  const typeSelectionne = typesFrais.find((type) => type.code === typeCode);
  const categoriesDisponibles = categories.filter((categorie) =>
    (typeSelectionne?.categoriesAutorisees ?? []).includes(categorie.code),
  );

  return categoriesDisponibles.find((categorie) => categorie.code === CATEGORIE_PAR_DEFAUT)?.code ?? categoriesDisponibles[0]?.code ?? '';
}

interface Props {
  jeton: string;
  projetId: number;
  typesFrais: ReferenceTypeFrais[];
  categories: Reference[];
  onCree: () => void;
  onErreur: (erreur: unknown) => void;
}

export default function FormulaireDepense({ jeton, projetId, typesFrais, categories, onCree, onErreur }: Props) {
  const typeInitial = trouverTypeInitial(typesFrais);
  const [date, setDate] = useState(aujourdhui());
  const [typeCode, setTypeCode] = useState(typeInitial);
  const [categorieCode, setCategorieCode] = useState(trouverCategorieInitiale(typeInitial, typesFrais, categories));
  const [elementDepense, setElementDepense] = useState('');
  const [montantHt, setMontantHt] = useState('0');
  const [tauxTva, setTauxTva] = useState('20');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const typeSelectionne = useMemo(
    () => typesFrais.find((type) => type.code === typeCode) ?? null,
    [typesFrais, typeCode],
  );
  const categorieRequise = typeSelectionne?.requiertCategorie ?? false;
  const categoriesDisponibles = useMemo(
    () => categories.filter((categorie) => (typeSelectionne?.categoriesAutorisees ?? []).includes(categorie.code)),
    [categories, typeSelectionne],
  );

  function changerType(typeSuivant: string) {
    setTypeCode(typeSuivant);
    setCategorieCode(trouverCategorieInitiale(typeSuivant, typesFrais, categories));
  }

  async function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    try {
      await creerDepense(jeton, projetId, {
        date,
        typeCode,
        categorieCode: categorieRequise ? (categorieCode || null) : null,
        elementDepense: elementDepense || null,
        montantHt: Number(montantHt),
        tauxTva: Number(tauxTva),
      });

      setElementDepense('');
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

      <Field label="Type de frais">
        <select className={inputClass} value={typeCode} onChange={(e) => changerType(e.target.value)}>
          {typesFrais.map((type) => (
            <option key={type.code} value={type.code}>
              {type.libelle}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Categorie">
        <select
          className={inputClass}
          value={categorieRequise ? categorieCode : ''}
          onChange={(e) => setCategorieCode(e.target.value)}
          disabled={!categorieRequise}
        >
          {categorieRequise ? (
            categoriesDisponibles.map((categorie) => (
              <option key={categorie.code} value={categorie.code}>
                {categorie.libelle}
              </option>
            ))
          ) : (
            <option value="">Sans objet pour ce type</option>
          )}
        </select>
      </Field>

      <Field label="Element de depense">
        <input className={inputClass} value={elementDepense} onChange={(e) => setElementDepense(e.target.value)} />
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

      {erreur && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 sm:col-span-2 lg:col-span-3">
          {erreur}
        </p>
      )}

      <Button className="sm:col-span-2 lg:col-span-3" type="submit" disabled={enCours}>
        {enCours ? 'Enregistrement…' : 'Ajouter la depense'}
      </Button>
    </form>
  );
}
