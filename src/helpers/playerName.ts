import { i18n } from "../i18n/i18n"
import { Player } from "../types"

export const playerName = (player: Player): string => player.name?.trim() || i18n(`player.${player.id}`)
