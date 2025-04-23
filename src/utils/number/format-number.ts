export type ValueFormatted = {
  value: number;
  formatted: string;
}

export function formatNumber(value: number): ValueFormatted {
  const formatted = new Intl.NumberFormat('pt-BR', {
    // style: 'currency',
    // currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return {
    formatted,
    value
  }
}
