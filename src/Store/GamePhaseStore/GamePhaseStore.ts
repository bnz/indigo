import { LocalStorageMgmnt } from "../LocalStorageMgmnt"
import { UIPhase } from "../../types"
import { makeAutoObservable } from "mobx"
import { UIKeys, UIValues } from "../UI"

export class GamePhaseStore {

    constructor(
        private storage: LocalStorageMgmnt<UIKeys, UIValues>,
    ) {
        makeAutoObservable(this)
    }

    private _phase = this.storage.getOrApply<UIPhase>("phase", () => UIPhase.PRE_GAME)

    get phase() {
        return this._phase
    }

    set phase(phase: UIPhase) {
        this._phase = phase
        this.storage.set("phase", this._phase)
    }

    goToPreGame = () => {
        this.phase = UIPhase.PRE_GAME
        this.storage.destroy()
    }

    goToPlayersSelection = () => {
        this.phase = UIPhase.PLAYERS_SELECTION
    }

    startGame = () => {
        this.phase = UIPhase.GAME
    }
}
