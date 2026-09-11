import { i18nKeys } from './i18nKeys'
import { rus } from './rus'
import { eng } from './eng'
import { LocalStorageMgmnt } from '../Storage/LocalStorageMgmnt'

export type Language = 'rus' | 'eng'

const languageDefaultState: Language = 'rus'

type I18n = (key: i18nKeys | string) => string

const savedLanguage = new LocalStorageMgmnt<string, Language>('ui').get('language')
const lang: Language = savedLanguage === 'eng' || savedLanguage === 'rus' ? savedLanguage : languageDefaultState

export type LanguageMap = Record<i18nKeys, string>

const languagesMap: Record<Language, LanguageMap> = {
  rus,
  eng,
}

export const i18n: I18n = (key) => {
  const res = languagesMap[lang][key as i18nKeys]

  if (res === undefined) {
    return `~${key}~`
  }

  return res
}
