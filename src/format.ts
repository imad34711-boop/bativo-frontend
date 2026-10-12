const FORMAT_MONTANT = new Intl.NumberFormat('fr-MA', {
  style: 'currency',
  currency: 'MAD',
  maximumFractionDigits: 2,
});

export function montant(valeur: number | null | undefined): string {
  return valeur === null || valeur === undefined ? '—' : FORMAT_MONTANT.format(valeur);
}

export function pourcentage(valeur: number | null | undefined): string {
  return valeur === null || valeur === undefined ? '—' : `${valeur.toLocaleString('fr-FR')} %`;
}

export function dateCourte(valeur: string | null | undefined): string {
  return valeur ? new Date(valeur).toLocaleDateString('fr-FR') : '—';
}

export function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}
