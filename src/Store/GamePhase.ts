import { iLocalStorageMgmnt } from './LocalStorageMgmnt'
import { GamePhase, Keys, Values } from '../types'
import { makeAutoObservable } from 'mobx'

export interface iGamePhaseStore {
  phase: GamePhase

  goToPreGame(): void

  goToPlayersSelection(): void

  startGame(): void
}

export class GamePhaseStore implements iGamePhaseStore {

  constructor(
    private storage: iLocalStorageMgmnt<Keys, Values>,
  ) {
    makeAutoObservable(this)
  }

  private _phase = this.storage.getOrApply<GamePhase>('phase', () => GamePhase.PRE_GAME)

  get phase() {
    return this._phase
  }

  set phase(phase: GamePhase) {
    this._phase = phase
    this.storage.set('phase', this._phase)
  }

  goToPreGame = () => {
    this.phase = GamePhase.PRE_GAME
    this.storage.destroy()
  }

  goToPlayersSelection = () => {
    this.phase = GamePhase.PLAYERS_SELECTION
  }

  startGame = () => {
    this.phase = GamePhase.IN_PLAY
  }

}
