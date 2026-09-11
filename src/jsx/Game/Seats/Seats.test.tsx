import { act, cleanup, render, screen } from "@testing-library/react"
import { runInAction } from "mobx"
import { COLLECTION_ANIMATION_MS, SCORE_ANIMATION_MS, Store } from "../../../Storage/Store/Store"
import { StoreProvider } from "../../../Storage/Store/StoreProvider"
import { applySit } from "../../../Storage/Store/applyers/applySit"
import { PlayerId, StoneType } from "../../../types"
import { Seats } from "./Seats"
import { TileActions } from "../TileActions/TileActions"

afterEach(() => {
    cleanup()
    jest.useRealTimers()
    jest.restoreAllMocks()
})

test("the last move and all award animations render without reading beyond the move tuple", () => {
    localStorage.clear()
    jest.useFakeTimers()
    const warnings = jest.spyOn(console, "warn").mockImplementation(() => {})
    const store = new Store()
    runInAction(() => {
        Object.values(store.stones).forEach(stone => { stone[4] = true })
        store.stones.a0 = [StoneType.amber, -3, 1, 3]
        store.playerMove = [PlayerId.Player1, "c", 0]
        store.hoveredId = "-4,1"
    })
    render(
        <StoreProvider store={store}>
            <Seats />
            <TileActions />
        </StoreProvider>,
    )
    act(() => applySit(store)())
    expect(store.playerMove).toEqual([PlayerId.Player1])
    expect(store.finished).toBe(true)
    expect(screen.queryByRole("img")).toBeNull()
    act(() => { jest.advanceTimersByTime(750) })
    expect(store.collecting).toBe(true)
    act(() => { jest.advanceTimersByTime(COLLECTION_ANIMATION_MS) })
    expect(store.scoreChanges).toHaveLength(1)
    act(() => { jest.advanceTimersByTime(SCORE_ANIMATION_MS) })
    expect(store.animatedStones).toBeNull()
    expect(warnings).not.toHaveBeenCalled()
})
