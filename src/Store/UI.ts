import { makeAutoObservable } from "mobx"
import { LocalStorageMgmnt } from "./LocalStorageMgmnt"
import { Language } from "../i18n/i18n"

type Keys = 'drawer' | 'language'

type Values = boolean | Language

export class UI {

    constructor() {
        makeAutoObservable(this)
    }

    storage = new LocalStorageMgmnt<Keys, Values>('ui')

    private _drawer = this.storage.getOrApply('drawer', () => false)

    get drawer() {
        return this._drawer
    }

    private set drawer(flag: boolean) {
        this._drawer = flag
        this.storage.set('drawer', this.drawer)
    }

    toggleDrawer = () => {
        this.drawer = !this.drawer
    }

    private _language: Language = this.storage.getOrApply('language', () => 'rus')

    get language() {
        return this._language
    }

    set language(language: Language) {
        this._language = language
        this.storage.set('language', this.language)
    }

    setLanguage = (language: Language): () => void => (): void => {
        this.storage.set('language', language)
        // eslint-disable-next-line no-self-assign
        window.location = window.location
    }

    dispose(): void {
        // TODO ?
    }
}
