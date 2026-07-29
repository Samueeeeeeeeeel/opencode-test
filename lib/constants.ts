export const APP_NAME = 'Aford';
export const APP_DESCRIPTION = 'Finanzas personales inteligentes';
export const DEFAULT_CURRENCY = 'CLP';
export const DEFAULT_LOCALE = 'es';
export const SUPPORTED_LOCALES = ['es', 'en'] as const;
export const MIN_INSTALLMENTS = 2;
export const MAX_INSTALLMENTS = 48;
export const MIN_CLOSING_DAY = 1;
export const MAX_CLOSING_DAY = 28;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
