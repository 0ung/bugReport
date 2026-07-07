import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type {
  FeedbackRating,
  IncidentSource,
  IncidentStatus,
  Severity,
} from '../types/incident'
import {
  interpolate,
  LanguageContext,
  STORAGE_KEY,
  translations,
  type Language,
  type LanguageContextValue,
  type TranslationKey,
  type Values,
} from './language'

function initialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'ko' || stored === 'en' ? stored : 'en'
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    window.localStorage.setItem(STORAGE_KEY, nextLanguage)
  }, [])

  const t = useCallback(
    (key: TranslationKey, values?: Values) => interpolate(translations[language][key], values),
    [language],
  )

  const formatDateTime = useCallback(
    (value: string) =>
      new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en', {
        month: language === 'ko' ? '2-digit' : 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value)),
    [language],
  )

  const formatDate = useCallback(
    (value: string) =>
      new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en', {
        year: 'numeric',
        month: language === 'ko' ? '2-digit' : 'short',
        day: '2-digit',
      }).format(new Date(value)),
    [language],
  )

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      formatDateTime,
      formatDate,
      severityLabel: (severity: Severity) => t(`severity.${severity}`),
      statusLabel: (status: IncidentStatus) => t(`status.${status}`),
      sourceLabel: (source: IncidentSource) => t(`source.${source}`),
      feedbackLabel: (rating: FeedbackRating) => t(`feedback.${rating}`),
    }),
    [formatDate, formatDateTime, language, setLanguage, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
