import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { AspectRatio } from '../AspectRatio/AspectRatio'
import { useStore } from "../../Store/StoreProvider"
import { i18n } from "../../i18n/i18n"
import playerStyles from "./Player/Player.module.css"

export const AddPlayer: FC = observer(() => (
    <div className={playerStyles.root} onClick={useStore().playersStore.addPlayer}>
        <AspectRatio>
            <button>
                {/*<AddIcon fontSize="large" />*/}
                <div>
                    {i18n('button.addPlayer')}
                </div>
            </button>
        </AspectRatio>
    </div>
))
