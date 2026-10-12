import type { Reference, ReferencesPayload, ReferenceTypeFrais } from './api/types';

/**
 * Valeurs de secours alignees sur les fixtures backend.
 *
 * Le front charge d'abord `/api/references` puis retombe sur ces valeurs
 * si l'appel n'a pas encore repondu.
 */
export const TYPES_FRAIS_PAR_DEFAUT: ReferenceTypeFrais[] = [
  {
    code: 'DIRECT',
    libelle: 'Frais directs',
    requiertCategorie: true,
    categoriesAutorisees: ['MATERIELS', 'MATERIAUX', 'MAIN_OEUVRE', 'SOUS_TRAITANT'],
  },
  {
    code: 'INDIRECT',
    libelle: 'Frais indirects',
    requiertCategorie: true,
    categoriesAutorisees: ['MATERIELS', 'MATERIAUX', 'MAIN_OEUVRE', 'SOUS_TRAITANT'],
  },
  { code: 'FRAIS_CHANTIER', libelle: 'Frais de chantier', requiertCategorie: false, categoriesAutorisees: [] },
  { code: 'FRAIS_GENERAL', libelle: 'Frais generaux', requiertCategorie: false, categoriesAutorisees: [] },
];

export const CATEGORIES_PAR_DEFAUT: Reference[] = [
  { code: 'MATERIELS', libelle: 'Materiels' },
  { code: 'MATERIAUX', libelle: 'Materiaux' },
  { code: 'MAIN_OEUVRE', libelle: "Main d'oeuvre" },
  { code: 'SOUS_TRAITANT', libelle: 'Sous-traitants' },
];

export const STATUTS_PROJET_PAR_DEFAUT: Reference[] = [
  { code: 'EN_PREPARATION', libelle: 'En preparation' },
  { code: 'EN_COURS', libelle: 'En cours' },
  { code: 'SUSPENDU', libelle: 'Suspendu' },
  { code: 'TERMINE', libelle: 'Termine' },
  { code: 'RECEPTIONNE', libelle: 'Receptionne' },
  { code: 'CLOTURE', libelle: 'Cloture' },
  { code: 'ANNULE', libelle: 'Annule' },
];

export const REFERENCES_PAR_DEFAUT: ReferencesPayload = {
  typesFrais: TYPES_FRAIS_PAR_DEFAUT,
  categories: CATEGORIES_PAR_DEFAUT,
  statutsProjet: STATUTS_PROJET_PAR_DEFAUT,
};
