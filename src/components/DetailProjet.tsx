import { useCallback, useEffect, useState, type ReactNode, type ThHTMLAttributes } from 'react';
import { chargerSynthese, listerDepenses, listerRevenues, supprimerDepense, supprimerRevenue } from '../api/bativo';
import { decrireErreur } from '../api/client';
import type { Depense, Projet, Reference, ReferenceTypeFrais, Revenue, Synthese } from '../api/types';
import { dateCourte, montant, pourcentage } from '../format';
import FormulaireDepense from './FormulaireDepense';
import FormulaireRevenue from './FormulaireRevenue';
import SegmentTabs from './ui/SegmentTabs';
import StatePanel from './ui/StatePanel';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface Props {
  jeton: string;
  projet: Projet;
  typesFrais: ReferenceTypeFrais[];
  categories: Reference[];
  onErreur: (erreur: unknown) => void;
}

export default function DetailProjet({ jeton, projet, typesFrais, categories, onErreur }: Props) {
  const [vue, setVue] = useState<'overview' | 'depenses' | 'revenues'>('overview');
  const [synthese, setSynthese] = useState<Synthese | null>(null);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const [resumeCharge, depensesChargees, revenuesCharges] = await Promise.all([
        chargerSynthese(jeton, projet.id),
        listerDepenses(jeton, projet.id),
        listerRevenues(jeton, projet.id),
      ]);

      setSynthese(resumeCharge);
      setDepenses(depensesChargees);
      setRevenues(revenuesCharges);
    } catch (cause) {
      setErreur(decrireErreur(cause));
      onErreur(cause);
    } finally {
      setChargement(false);
    }
  }, [jeton, projet.id, onErreur]);

  useEffect(() => {
    void recharger();
  }, [recharger]);

  async function retirerDepense(id: number) {
    try {
      await supprimerDepense(jeton, id);
      await recharger();
    } catch (cause) {
      setErreur(decrireErreur(cause));
      onErreur(cause);
    }
  }

  async function retirerRevenue(id: number) {
    try {
      await supprimerRevenue(jeton, id);
      await recharger();
    } catch (cause) {
      setErreur(decrireErreur(cause));
      onErreur(cause);
    }
  }

  const prochainDecompte = revenues.reduce((max, revenue) => Math.max(max, revenue.numeroDecompte), 0) + 1;

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{projet.numeroMarche}</h2>
          <p className="text-sm text-slate-500">{projet.objet}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void recharger()} disabled={chargement}>
          {chargement ? 'Chargement…' : 'Rafraichir'}
        </Button>
      </header>

      {erreur && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
          {erreur}
        </p>
      )}

      <SegmentTabs
        ariaLabel="Navigation du detail projet"
        value={vue}
        onChange={setVue}
        items={[
          { key: 'overview', label: 'Vue d\'ensemble' },
          { key: 'depenses', label: 'Depenses' },
          { key: 'revenues', label: 'Decomptes' },
        ]}
      />

      {vue === 'overview' && !synthese && !chargement && (
        <StatePanel
          state="empty"
          title="Synthese indisponible"
          description="Les donnees de synthese seront visibles apres la premiere depense ou le premier decompte."
        />
      )}

      {vue === 'overview' && synthese && <ChiffresCles synthese={synthese} />}

      {vue === 'depenses' && (
        <section className="grid gap-4 border-t border-slate-100 pt-4">
          <h3 className="text-base font-bold text-slate-900">Depenses ({depenses.length})</h3>
          <FormulaireDepense
            jeton={jeton}
            projetId={projet.id}
            typesFrais={typesFrais}
            categories={categories}
            onCree={() => void recharger()}
            onErreur={onErreur}
          />

          {depenses.length === 0 ? (
            <StatePanel state="empty" title="Aucune depense" description="Ajoutez une depense pour alimenter le suivi financier." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th>Categorie</Th>
                    <Th>Element</Th>
                    <Th align="right">Montant HT</Th>
                    <Th align="right">Montant TTC</Th>
                    <Th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {depenses.map((depense) => (
                    <tr key={depense.id} className="hover:bg-slate-50/70">
                      <Td>{dateCourte(depense.date)}</Td>
                      <Td>{depense.type.libelle}</Td>
                      <Td>{depense.categorie?.libelle ?? '—'}</Td>
                      <Td>{depense.elementDepense ?? '—'}</Td>
                      <Td align="right">{montant(depense.montantHt)}</Td>
                      <Td align="right" className="font-semibold text-slate-800">
                        {montant(depense.montantTtc)}
                      </Td>
                      <Td>
                        <Button variant="secondary" size="sm" onClick={() => void retirerDepense(depense.id)}>
                          Supprimer
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {vue === 'revenues' && (
        <section className="grid gap-4 border-t border-slate-100 pt-4">
          <h3 className="text-base font-bold text-slate-900">Decomptes ({revenues.length})</h3>
          <FormulaireRevenue
            jeton={jeton}
            projetId={projet.id}
            prochainDecompte={prochainDecompte}
            onCree={() => void recharger()}
            onErreur={onErreur}
          />

          {revenues.length === 0 ? (
            <StatePanel state="empty" title="Aucun decompte" description="Ajoutez un decompte pour suivre la facturation." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <Th>N°</Th>
                    <Th>Date</Th>
                    <Th align="right">Montant TTC</Th>
                    <Th align="right">RG theorique</Th>
                    <Th align="right">RG retenue</Th>
                    <Th align="right">Net a payer</Th>
                    <Th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revenues.map((revenue) => (
                    <tr key={revenue.id} className="hover:bg-slate-50/70">
                      <Td>{revenue.numeroDecompte}</Td>
                      <Td>{dateCourte(revenue.date)}</Td>
                      <Td align="right">{montant(revenue.montantTtc)}</Td>
                      <Td align="right">{montant(revenue.retenueGarantieTheorique)}</Td>
                      <Td align="right">
                        <span className="inline-flex items-center gap-1.5">
                          {montant(revenue.retenueGarantie)}
                          {revenue.retenueGarantiePlafonnee && <Badge tone="warning">plafonnee</Badge>}
                        </span>
                      </Td>
                      <Td align="right" className="font-semibold text-slate-800">
                        {montant(revenue.montantFacture)}
                      </Td>
                      <Td>
                        <Button variant="secondary" size="sm" onClick={() => void retirerRevenue(revenue.id)}>
                          Supprimer
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Th({
  children,
  align = 'left',
  ...rest
}: { children?: ReactNode; align?: 'left' | 'right' } & ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
      {...rest}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
  className = '',
}: {
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <td className={`px-3 py-2.5 text-slate-600 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>
      {children}
    </td>
  );
}

function ChiffresCles({ synthese }: { synthese: Synthese }) {
  const { marche, depenses, revenues, retenueGarantie, resultat } = synthese;

  return (
    <section className="grid gap-4 border-t border-slate-100 pt-4">
      <h3 className="text-base font-bold text-slate-900">Chiffres cles</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Indicateur libelle="Marche TTC" valeur={montant(marche.montantTtc)} detail={`HT ${montant(marche.montantHt)}`} />
        <Indicateur
          libelle="Depenses TTC"
          valeur={montant(depenses.montantTtc)}
          detail={`${depenses.nombre} ligne(s)`}
        />
        <Indicateur
          libelle="Revenues TTC"
          valeur={montant(revenues.montantTtc)}
          detail={`Facture ${montant(revenues.montantFacture)}`}
        />
        <Indicateur
          libelle="Retenue de garantie"
          valeur={montant(retenueGarantie.cumul)}
          detail={
            retenueGarantie.plafond === null
              ? 'Aucun plafond (marche non renseigne)'
              : `Plafond ${montant(retenueGarantie.plafond)} · reste ${montant(retenueGarantie.restant)}`
          }
          alerte={retenueGarantie.plafondAtteint}
        />
        <Indicateur
          libelle="Marge"
          valeur={montant(resultat.marge)}
          detail={`Taux ${pourcentage(resultat.tauxMarge)}`}
          alerte={resultat.marge < 0}
        />
        <Indicateur libelle="Avancement" valeur={pourcentage(resultat.avancement)} detail="Revenues HT / marche HT" />
      </div>

      {Object.keys(depenses.parType).length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {Object.entries(depenses.parType).map(([type, valeur]) => (
            <li key={type}>
              <Badge tone="neutral">
                {type} · {montant(valeur)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Indicateur({
  libelle,
  valeur,
  detail,
  alerte = false,
}: {
  libelle: string;
  valeur: string;
  detail: string;
  alerte?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border p-4 ${
        alerte ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50/60'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{libelle}</p>
      <p className="mt-1 text-lg font-extrabold text-slate-900">{valeur}</p>
      <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
    </article>
  );
}
