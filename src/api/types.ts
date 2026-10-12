export interface Reference {
  code: string;
  libelle: string;
}

export interface ReferenceTypeFrais extends Reference {
  requiertCategorie: boolean;
  categoriesAutorisees: string[];
}

export interface ReferencesPayload {
  typesFrais: ReferenceTypeFrais[];
  categories: Reference[];
  statutsProjet: Reference[];
}

export interface Profil {
  id: number;
  email: string;
  nom: string;
  prenom: string | null;
  actif: boolean;
  organisme: {
    id: number;
    code: string;
    nom: string;
  };
  roles: string[];
  permissions: string[];
}

export interface Projet {
  id: number;
  numero: number | null;
  numeroMarche: string;
  objet: string;
  ville: string | null;
  montantMarcheHt: number;
  tauxTva: number;
  montantMarcheTva: number;
  montantMarcheTtc: number;
  tauxRetenueGarantie: number;
  tauxPlafondRetenueGarantie: number;
  plafondRetenueGarantie: number | null;
  maitreOuvrage: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  joursRestants: number | null;
  organisme: {
    id: number;
    code: string;
    nom: string;
  };
  statut: Reference | null;
}

export interface PageProjets {
  items: Projet[];
  page: number;
  taille: number;
  total: number;
}

export interface Depense {
  id: number;
  projetId: number;
  date: string;
  annee: number;
  type: Reference;
  categorie: Reference | null;
  sousCategorie: string | null;
  elementDepense: string | null;
  description: string | null;
  montantHt: number;
  montantTva: number;
  montantTtc: number;
  fournisseur: string | null;
  saisiPar: {
    id: number;
    email: string;
    nom: string;
    prenom: string | null;
  };
}

export interface Revenue {
  id: number;
  projetId: number;
  date: string;
  annee: number;
  numeroDecompte: number;
  montantHt: number;
  montantTva: number;
  montantTtc: number;
  tauxRetenueGarantie: number;
  retenueGarantieTheorique: number;
  retenueGarantie: number;
  retenueGarantiePlafonnee: boolean;
  montantFacture: number;
  saisiPar: {
    id: number;
    email: string;
    nom: string;
    prenom: string | null;
  };
}

export interface Organisme {
  id: number;
  code: string;
  nom: string;
  metadata: Record<string, unknown>;
}

export interface Synthese {
  projetId: number;
  numeroMarche: string;
  objet: string;
  marche: {
    montantHt: number;
    montantTva: number;
    montantTtc: number;
  };
  depenses: {
    nombre: number;
    montantHt: number;
    montantTva: number;
    montantTtc: number;
    parType: Record<string, number>;
  };
  revenues: {
    nombre: number;
    montantHt: number;
    montantTva: number;
    montantTtc: number;
    montantFacture: number;
  };
  retenueGarantie: {
    taux: number;
    tauxPlafond: number;
    plafond: number | null;
    cumul: number;
    restant: number | null;
    plafondAtteint: boolean;
  };
  resultat: {
    marge: number;
    tauxMarge: number | null;
    avancement: number | null;
  };
}

export interface Session {
  jeton: string;
  profil: Profil;
}

export interface AdminPermission {
  id: number;
  code: string;
  ressource: string;
  action: string;
  libelle: string | null;
}

export interface AdminRole {
  id: number;
  code: string;
  libelle: string;
  description: string | null;
  permissionCodes: string[];
}

export interface AdminUserAssignment {
  roleCode: string;
  roleLibelle: string;
  scope: 'global' | 'projet';
  projetId: number | null;
  projetNumeroMarche: string | null;
}

export interface AdminUser {
  id: number;
  email: string;
  nom: string;
  prenom: string | null;
  actif: boolean;
  organisme: Organisme;
  roles: string[];
  permissions: string[];
  assignments: AdminUserAssignment[];
}

export interface AdminUserInput {
  email: string;
  nom: string;
  prenom?: string | null;
  password: string;
  actif: boolean;
  organismeId?: number;
  roleCodes: string[];
}

export interface AdminUserUpdate {
  email?: string;
  nom?: string;
  prenom?: string | null;
  password?: string;
  actif?: boolean;
  organismeId?: number;
  roleCodes?: string[];
}

export interface AdminUserAssignmentInput {
  roleCode: string;
  scope: 'global' | 'projet';
  projetId?: number;
}

export interface AdminRoleInput {
  code: string;
  libelle: string;
  description?: string | null;
  permissionCodes: string[];
}

export interface AdminRoleUpdate {
  code?: string;
  libelle?: string;
  description?: string | null;
  permissionCodes?: string[];
}

export interface NouveauProjet {
  numeroMarche: string;
  objet: string;
  ville?: string | null;
  montantMarcheHt: number;
  tauxTva: number;
  tauxRetenueGarantie: number;
  tauxPlafondRetenueGarantie: number;
  statutCode?: string | null;
}

export interface NouvelleDepense {
  date: string;
  typeCode: string;
  categorieCode: string | null;
  sousCategorie?: string | null;
  elementDepense?: string | null;
  montantHt: number;
  tauxTva: number;
  fournisseur?: string | null;
}

export interface NouveauRevenue {
  date: string;
  numeroDecompte: number;
  montantHt: number;
  tauxTva: number;
  tauxRetenueGarantie: number;
}
