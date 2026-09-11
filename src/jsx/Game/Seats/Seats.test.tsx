import { act, cleanup, render, screen } from "@testing-library/react"
import { runInAction } from "mobx"
import { COLLECTION_ANIMATION_MS, SCORE_ANIMATION_MS, Store } from "../../../Storage/Store/Store"
import { StoreProvider } from "../../../Storage/Store/StoreProvider"
import { applySit } from "../../../Storage/Store/applyers/applySit"
import { PlayerId, StoneId, StoneType } from "../../../types"
import { Seats } from "./Seats"
import { TileActions } from "../TileActions/TileActions"
import { CollisionEffects } from "../Stones/CollisionEffects"

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

test("renders a visible collision effect at the resolved impact", () => {
    localStorage.clear()
    const store = new Store()
    runInAction(() => {
        store.collisions = [{ stoneIds: [StoneId.amber0, StoneId.amber1], q: -2, r: 1 }]
    })
    render(
        <StoreProvider store={store}>
            <CollisionEffects />
        </StoreProvider>,
    )
    expect(screen.getByTestId("collision-effect").getAttribute("data-collision")).toBe("a0,a1")
})

test("shows configured names in the active turn and score summary", () => {
    localStorage.clear()
    const store = new Store()
    store.playersStore.setPlayerName(PlayerId.Player1, "Ada")
    render(
        <StoreProvider store={store}>
            <TileActions />
        </StoreProvider>,
    )
    expect(screen.getAllByText(/Ada/).length).toBeGreaterThan(0)
})
