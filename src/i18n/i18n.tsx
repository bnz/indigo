// import { Language, languageDefaultState } from '../../redux/reducers/language'
import { i18nKeys } from './i18nKeys'
import { rus } from './rus'
import { eng } from './eng'

export type Language = 'rus' | 'eng'

const languageDefaultState: Language = 'rus'

type I18n = (key: i18nKeys | string) => string

const commonSettings = JSON.parse(localStorage.getItem('ui') || JSON.stringify({
  language: languageDefaultState,
}))

const lang: Language = commonSettings.language || languageDefaultState

export type LanguageMap = Record<i18nKeys, string>

type LanguagesMap = Record<Language, LanguageMap>

const languagesMap: LanguagesMap = {
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
