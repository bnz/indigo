import { PlayerId } from "../../../types"
import { Store } from "../Store"

export const getGateway = (store: Store) => (position: number): PlayerId => (
    store.playersStore.players[store.gates[position]].id
)
