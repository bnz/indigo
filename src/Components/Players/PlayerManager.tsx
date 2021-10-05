import { observer } from "mobx-react"
import { FC } from "react"
import { Paper } from "../Paper/Paper"
import { i18n } from "../../i18n/i18n"
import { useUIStore } from "../../Store/UIProvider"
import styles from "./PlayerManager.module.css"
import { useStore } from "../../Store/StoreProvider"
import { Player } from "./Player/Player"
import { AddPlayer } from "./AddPlayer"

export const PlayerManager: FC = observer(() => {
    const uiStore = useUIStore()
    const store = useStore()

    return (
        <>
            <Paper>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. A, ab ad aliquam asperiores, atque autem
                beatae eaque esse excepturi illo inventore nam nobis odio quas quia quod veniam voluptatem voluptates!
            </Paper>
            <div style={{
                margin: '0 auto',
                padding: "calc(var(--spacing) * 3) 0",
                display: 'flex',
                flexWrap: 'wrap',
            }}>
                {store.playersStore.entries.map(([, { id }]) => (
                    <Player key={id} id={id} />
                ))}
                {store.playersStore.entries.length < 4 && (
                    <AddPlayer />
                )}
            </div>
            <div style={{
                padding: "var(--spacing)",
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}>
                <button
                    className={styles.cancelButton}
                    onClick={uiStore.gamePhase.goToPreGame}
                >
                    {i18n("button.cancel")}
                </button>
                <button
                    className={styles.startGameButton}
                >
                    {i18n("button.startGame")}
                </button>
            </div>
        </>
    )
})

/*
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { useStore } from '../Store/HexProvider'
import { PlayersWrapper } from './PlayersWrapper'
import { Player } from './Player'
import { AddPlayer } from './AddPlayer'
import { PlayerWrapper } from './PlayerWrapper'
import Paper from '@material-ui/core/Paper'
import { PlayersActions } from './PlayersActions'

export const PlayerManager: FC = observer(() => {
  const store = useStore()

  return (
    <>
      <Paper style={{
        padding: 16,
      }}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. A, ab ad aliquam asperiores, atque autem beatae eaque
        esse excepturi illo inventore nam nobis odio quas quia quod veniam voluptatem voluptates!
      </Paper>
      <PlayersWrapper>
        {store.playersStore.entries.map(([dataId, { id }]) => (
          <Player key={dataId} id={id} />
        ))}
        {store.playersStore.entries.length < 4 && (
          <AddPlayer />
        )}
        {store.playersStore.entries.length === 2 && (
          <PlayerWrapper />
        )}
      </PlayersWrapper>
      <PlayersActions />
    </>
  )
})

 */
