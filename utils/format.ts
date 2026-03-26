export const formatMoney = (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
    return Math.floor(n).toString();
};

// Full Brazilian number format: 235000 → "235.000"
export const formatBRL = (n: number): string => Math.round(n).toLocaleString('pt-BR');
