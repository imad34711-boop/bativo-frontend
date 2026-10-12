import { useEffect, useMemo, useState } from 'react';
import { chargerSynthese, listerProjets } from '../api/bativo';
import { decrireErreur } from '../api/client';
import { montant } from '../format';
import type { PageProjets, Profil, Projet, Synthese } from '../api/types';
import StatePanel from './ui/StatePanel';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface Props {
  profil: Profil;
  jeton: string;
}

interface KpiTuile {
  titre: string;
  valeur: string;
  detail: string;
  icone: string;
  gradient: string;
}

function TuileKpi({ titre, valeur, detail, icone, gradient }: KpiTuile) {
  return (
    <Card className="relative overflow-hidden !p-5">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-xl`} />
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titre}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-base shadow-sm`}>
          {icone}
        </span>
      </div>
      <p className="relative mt-2 text-2xl font-extrabold leading-tight tracking-tight text-slate-900">{valeur}</p>
      <p className="relative mt-1 text-xs text-slate-500">{detail}</p>
    </Card>
  );
}

export default function TableauBord({ profil, jeton }: Props) {
  const [page, setPage] = useState<PageProjets | null>(null);
  const [syntheseFocus, setSyntheseFocus] = useState<Synthese | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;

    async function charger() {
      setChargement(true);
      setErreur(null);

      try {
        const response = await listerProjets(jeton);
        if (!annule) {
          setPage(response);
        }
      } catch (cause) {
        if (!annule) {
          setErreur(decrireErreur(cause));
        }
      } finally {
        if (!annule) {
          setChargement(false);
        }
      }
    }

    void charger();

    return () => {
      annule = true;
    };
  }, [jeton]);

  const projets = page?.items ?? [];
  const projetFocus = useMemo(
    () =>
      [...projets]
        .sort((a, b) => (a.joursRestants ?? Number.MAX_SAFE_INTEGER) - (b.joursRestants ?? Number.MAX_SAFE_INTEGER))[0] ?? null,
    [projets],
  );

  useEffect(() => {
    let annule = false;

    async function chargerFocus() {
      if (!projetFocus) {
        setSyntheseFocus(null);
        return;
      }

      try {
        const data = await chargerSynthese(jeton, projetFocus.id);
        if (!annule) {
          setSyntheseFocus(data);
        }
      } catch {
        if (!annule) {
          setSyntheseFocus(null);
        }
      }
    }

    void chargerFocus();

    return () => {
      annule = true;
    };
  }, [jeton, projetFocus]);

  const kpi = useMemo(() => {
    const now = new Date();
    const totalTtc = projets.reduce((somme, projet) => somme + projet.montantMarcheTtc, 0);
    const avecEcheance = projets.filter((projet) => projet.joursRestants !== null);
    const enRetard = avecEcheance.filter((projet) => (projet.joursRestants ?? 0) < 0);
    const critiques = avecEcheance.filter((projet) => {
      const jours = projet.joursRestants ?? 0;
      return jours >= 0 && jours <= 15;
    });

    const prochainEcheance = [...avecEcheance]
      .filter((projet) => (projet.joursRestants ?? Number.MAX_SAFE_INTEGER) >= 0)
      .sort((a, b) => (a.joursRestants ?? Number.MAX_SAFE_INTEGER) - (b.joursRestants ?? Number.MAX_SAFE_INTEGER))[0] ?? null;

    const budgetMoyen = projets.length > 0 ? totalTtc / projets.length : 0;

    return {
      totalTtc,
      budgetMoyen,
      total: projets.length,
      actifs: projets.filter((projet) => projet.statut?.code !== 'CLOTURE').length,
      enRetard: enRetard.length,
      critiques: critiques.length,
      prochainEcheance,
      dateMaj: now.toLocaleString('fr-MA'),
    };
  }, [projets]);

  return (
    <div className="grid gap-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-6 py-7 shadow-lg shadow-blue-600/25 sm:px-8">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Pilotage Projets</p>
        <h2 className="relative mt-1 text-2xl font-extrabold text-white sm:text-3xl">
          Bonjour {profil.prenom ?? profil.nom}
        </h2>
        <p className="relative mt-2 max-w-xl text-sm text-blue-100">
          Vue metier du portefeuille: budget, cadence des decomptes et pression calendrier.
        </p>
      </div>

      {erreur && <StatePanel state="error" title="Dashboard indisponible" description={erreur} />}

      {chargement && (
        <StatePanel state="loading" title="Chargement des KPI" description="Analyse du portefeuille en cours..." />
      )}

      {!chargement && !erreur && projets.length === 0 && (
        <StatePanel
          state="empty"
          title="Aucun projet disponible"
          description="Creez un projet pour alimenter ce dashboard metier."
        />
      )}

      {!chargement && !erreur && projets.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <TuileKpi
              titre="Portefeuille TTC"
              valeur={montant(kpi.totalTtc)}
              detail={`Budget moyen: ${montant(kpi.budgetMoyen)}`}
              icone="💰"
              gradient="from-blue-500 to-indigo-500"
            />
            <TuileKpi
              titre="Projets actifs"
              valeur={String(kpi.actifs)}
              detail={`Total portefeuille: ${kpi.total}`}
              icone="🏗️"
              gradient="from-emerald-500 to-teal-500"
            />
            <TuileKpi
              titre="Echeances critiques"
              valeur={String(kpi.critiques)}
              detail={`Projets en retard: ${kpi.enRetard}`}
              icone="⏱️"
              gradient="from-amber-500 to-orange-500"
            />
            <TuileKpi
              titre="Prochaine echeance"
              valeur={kpi.prochainEcheance?.numeroMarche ?? '—'}
              detail={
                kpi.prochainEcheance?.joursRestants !== null && kpi.prochainEcheance
                  ? `${kpi.prochainEcheance.joursRestants} jour(s) restant(s)`
                  : 'Aucune date de fin renseignee'
              }
              icone="📅"
              gradient="from-rose-500 to-pink-500"
            />
            <TuileKpi
              titre="Derniere actualisation"
              valeur={kpi.dateMaj}
              detail="Horodatage local du chargement dashboard."
              icone="🔄"
              gradient="from-violet-500 to-purple-500"
            />
          </div>

          <Card>
            <h3 className="text-base font-bold text-slate-900">Points d&apos;attention calendrier</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {projets
                .filter((projet) => projet.joursRestants !== null)
                .sort((a, b) => (a.joursRestants ?? 0) - (b.joursRestants ?? 0))
                .slice(0, 6)
                .map((projet: Projet) => {
                  const jours = projet.joursRestants ?? 0;
                  const tone = jours < 0 ? 'danger' : jours <= 15 ? 'warning' : 'brand';
                  return (
                    <li key={projet.id}>
                      <Badge tone={tone}>
                        {projet.numeroMarche} · {jours} j
                      </Badge>
                    </li>
                  );
                })}
            </ul>
          </Card>

          {syntheseFocus && (
            <Card>
              <h3 className="text-base font-bold text-slate-900">
                Focus projet: <span className="text-blue-600">{syntheseFocus.numeroMarche}</span>
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TuileKpi
                  titre="Depenses TTC"
                  valeur={montant(syntheseFocus.depenses.montantTtc)}
                  detail={`${syntheseFocus.depenses.nombre} depense(s)`}
                  icone="🧾"
                  gradient="from-orange-500 to-amber-500"
                />
                <TuileKpi
                  titre="Decomptes TTC"
                  valeur={montant(syntheseFocus.revenues.montantTtc)}
                  detail={`${syntheseFocus.revenues.nombre} decompte(s)`}
                  icone="📄"
                  gradient="from-blue-500 to-cyan-500"
                />
                <TuileKpi
                  titre="Marge"
                  valeur={montant(syntheseFocus.resultat.marge)}
                  detail={`Avancement: ${
                    syntheseFocus.resultat.avancement === null ? '—' : `${Math.round(syntheseFocus.resultat.avancement * 100)}%`
                  }`}
                  icone="📈"
                  gradient="from-emerald-500 to-green-500"
                />
                <TuileKpi
                  titre="Retenue restante"
                  valeur={
                    syntheseFocus.retenueGarantie.restant === null ? '—' : montant(syntheseFocus.retenueGarantie.restant)
                  }
                  detail={`Plafond: ${
                    syntheseFocus.retenueGarantie.plafond === null ? 'Non renseigne' : montant(syntheseFocus.retenueGarantie.plafond)
                  }`}
                  icone="🔒"
                  gradient="from-violet-500 to-fuchsia-500"
                />
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
