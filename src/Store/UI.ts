import { makeAutoObservable, runInAction } from "mobx"
import { LocalStorageMgmnt } from "./LocalStorageMgmnt"
import { Language } from "../i18n/i18n"

type Theme = "light" | "dark"

type Keys = 'drawer' | 'language' | 'theme' | 'theme-system'

type Values = boolean | Language | Theme

export class UI {

    /**
     * Defaults
     */
    private defaultDrawerState = false
    private defaultLanguage: Language = "rus"
    private defaultTheme: Theme = "light"
    private defaultThemeSystem = true

    constructor() {
        makeAutoObservable(this)

        UI.matchMedia.addEventListener("change", this.matchMediaListener, true)
    }

    private matchMediaListener = (e: any) => {
        this.theme = UI.toggleTheme(e)
    }

    storage = new LocalStorageMgmnt<Keys, Values>('ui')

    private _drawer = this.storage.getOrApply('drawer', () => this.defaultDrawerState)

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

    private _language: Language = this.storage.getOrApply('language', () => this.defaultLanguage)

    get language() {
        return this._language
    }

    set language(language: Language) {
        this._language = language
        this.storage.set('language', this.language)
    }

    setLanguage = (language: Language): () => void => (): void => {
        this.language = language
        // eslint-disable-next-line no-self-assign
        window.location = window.location
    }

    private static get matchMedia() {
        return window.matchMedia('(prefers-color-scheme: dark)')
    }

    private static toggleTheme(e: any): Theme {
        return e.matches ? "dark" : "light"
    }

    private static get systemTheme(): Theme {
        return UI.toggleTheme(UI.matchMedia)
    }

    private _theme: Theme = this.storage.getOrApply("theme", () => UI.systemTheme)

    get theme(): Theme {
        return this._theme
    }

    set theme(theme: Theme) {
        this.storage.set('theme', theme)
        this._theme = theme
    }

    changeTheme = (theme: Theme): () => void => () => {
        runInAction(() => {
            this.theme = theme
        })
    }

    private _themeSystem = this.storage.getOrApply('theme-system', () => this.defaultThemeSystem)

    get themeSystem(): boolean {
        return this._themeSystem
    }

    set themeSystem(flag) {
        this.storage.set('theme-system', flag)
        this._themeSystem = flag
    }

    useSystemTheme = (): void => {
        this.themeSystem = !this.themeSystem
    }

    dispose(): void {
        UI.matchMedia.removeEventListener("change", this.matchMediaListener)
    }
}
