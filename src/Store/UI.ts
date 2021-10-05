import { makeAutoObservable, reaction, runInAction } from "mobx"
import { LocalStorageMgmnt } from "./LocalStorageMgmnt"
import { Language } from "../i18n/i18n"
import { GamePhaseStore } from "./GamePhase"
import { UIPhase } from "../types"

type Theme = "light" | "dark"

export type UIKeys = 'drawer' | 'language' | 'theme' | 'theme-system' | 'phase'

export type UIValues = boolean | Language | Theme | UIPhase

export class UI {

    /**
     * Defaults
     */
    private defaultDrawerState = false
    private defaultLanguage: Language = "rus"
    private defaultTheme: Theme = "light"
    private defaultThemeSystem = true

    private html = document.getElementsByTagName("html")[0]

    constructor() {
        makeAutoObservable(this)

        // Theme stuff
        this.themeReaction({ theme: this.theme, themeSystem: this.themeSystem })
        reaction(() => ({ theme: this.theme, themeSystem: this.themeSystem }), this.themeReaction)
        UI.matchMedia.addEventListener("change", this.matchMediaListener, true)

        // Drawer stuff
        reaction(() => this.drawer, this.drawerReaction)
    }

    storage = new LocalStorageMgmnt<UIKeys, UIValues>('ui')

    gamePhase = new GamePhaseStore(this.storage)

    // Drawer - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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

    drawerReaction = (flag: boolean) => {
        if (flag) {
            this.html.style.overflow = "hidden"
        } else {
            this.html.style.overflow = "visible"
        }
    }

    // Language - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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

    // Theme - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private static get matchMedia() {
        return window.matchMedia('(prefers-color-scheme: dark)')
    }

    private static toggleTheme(e: any): Theme {
        return e.matches ? "dark" : "light"
    }

    private matchMediaListener = (e: any) => {
        this.theme = UI.toggleTheme(e)
    }

    private _theme: Theme = this.storage.getOrApply("theme", () => UI.toggleTheme(UI.matchMedia))

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

    // Theme System - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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

    // Theme + Theme System - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private themeReaction = ({ theme, themeSystem }: { theme: Theme, themeSystem: boolean }): void => {
        this.html.classList.remove(...this.html.classList)
        if (!themeSystem) {
            if (theme === "dark") {
                this.html.classList.add("theme-dark")
            } else {
                this.html.classList.add("theme-light")
            }
        }
    }

    dispose(): void {
        UI.matchMedia.removeEventListener("change", this.matchMediaListener)
    }
}
