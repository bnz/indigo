import { makeAutoObservable } from "mobx"
import { LocalStorageMgmnt } from "./LocalStorageMgmnt"

type Keys = 'drawer'

type Values = boolean

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

    dispose(): void {
        // TODO ?
    }
}
