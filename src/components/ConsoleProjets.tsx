import { useCallback, useEffect, useState } from 'react';
import { chargerReferences, listerProjets, supprimerProjet } from '../api/bativo';
import { ApiError, decrireErreur } from '../api/client';
import type { Projet, ReferencesPayload, Session } from '../api/types';
import { montant } from '../format';
import { REFERENCES_PAR_DEFAUT } from '../references';
import DetailProjet from './DetailProjet';
import FormulaireProjet from './FormulaireProjet';
import StatePanel from './ui/StatePanel';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface Props {
  session: Session;
  onSessionExpiree: (message: string) => void;
}

export default function ConsoleProjets({ session, onSessionExpiree }: Props) {
  const { jeton } = session;
  const [projets, setProjets] = useState<Projet[]>([]);
  const [references, setReferences] = useState<ReferencesPayload>(REFERENCES_PAR_DEFAUT);
  const [afficherCreation, setAfficherCreation] = useState(false);
  const [selectionId, setSelectionId] = useState<number | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  const signalerErreur = useCallback(
    (cause: unknown) => {
      if (cause instanceof ApiError && cause.estNonAutorise) {
        onSessionExpiree(cause.message);
      }
    },
    [onSessionExpiree],
  );

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const [page, referencesChargees] = await Promise.all([listerProjets(jeton), chargerReferences(jeton)]);
      setReferences(referencesChargees);
      setProjets(page.items);
      setSelectionId((precedent) =>
        precedent !== null && page.items.some((projet) => projet.id === precedent) ? precedent : (page.items[0]?.id ?? null),
      );
    } catch (cause) {
      setErreur(decrireErreur(cause));
      signalerErreur(cause);
    } finally {
      setChargement(false);
    }
  }, [jeton, signalerErreur]);

  useEffect(() => {
    void recharger();
  }, [recharger]);

  async function retirerProjet(id: number) {
    try {
      await supprimerProjet(jeton, id);
      await recharger();
    } catch (cause) {
      setErreur(decrireErreur(cause));
      signalerErreur(cause);
    }
  }

  const selection = projets.find((projet) => projet.id === selectionId) ?? null;

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Projets ({projets.length})</h2>
          <Button variant={afficherCreation ? 'secondary' : 'primary'} size="sm" onClick={() => setAfficherCreation((v) => !v)}>
            {afficherCreation ? 'Masquer creation' : '+ Nouveau projet'}
          </Button>
        </div>

        {afficherCreation && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <FormulaireProjet
              jeton={jeton}
              statutsProjet={references.statutsProjet}
              onCree={() => {
                setAfficherCreation(false);
                void recharger();
              }}
              onErreur={signalerErreur}
            />
          </div>
        )}

        {erreur && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
            {erreur}
          </p>
        )}

        {chargement && (
          <div className="mt-4">
            <StatePanel
              state="loading"
              title="Chargement des projets"
              description="Recuperation des references et du portefeuille en cours."
            />
          </div>
        )}

        {!chargement && projets.length === 0 && (
          <div className="mt-4">
            <StatePanel
              state="empty"
              title="Aucun projet visible"
              description="Creez un premier projet pour demarrer le suivi budgetaire."
            />
          </div>
        )}

        <ul className="mt-4 grid gap-2">
          {projets.map((projet) => {
            const actif = projet.id === selectionId;
            return (
              <li key={projet.id} className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => setSelectionId(projet.id)}
                  className={`flex flex-1 flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                    actif
                      ? 'border-blue-300 bg-blue-50/80 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                  }`}
                >
                  <span className="font-bold text-slate-900">{projet.numeroMarche}</span>
                  <span className="flex-1 truncate text-sm text-slate-500">{projet.objet}</span>
                  <span className="font-semibold text-slate-700">{montant(projet.montantMarcheTtc)}</span>
                  {projet.statut && <Badge tone="brand">{projet.statut.libelle}</Badge>}
                </button>
                <Button variant="secondary" size="sm" onClick={() => void retirerProjet(projet.id)}>
                  Supprimer
                </Button>
              </li>
            );
          })}
        </ul>
      </Card>

      {selection && (
        <Card>
          <DetailProjet
            jeton={jeton}
            projet={selection}
            typesFrais={references.typesFrais}
            categories={references.categories}
            onErreur={signalerErreur}
          />
        </Card>
      )}
    </div>
  );
}
