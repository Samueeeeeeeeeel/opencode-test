import 'server-only';

import type { Locale } from './constants';
import { SUPPORTED_LOCALES } from './constants';

const dictionaries = {
  es: () => import('@/messages/es.json').then((m) => m.default),
  en: () => import('@/messages/en.json').then((m) => m.default),
} as const;

export const hasLocale = (locale: string): locale is Locale =>
  SUPPORTED_LOCALES.includes(locale as Locale);

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
