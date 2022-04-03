import { StoneId } from "../types"

export const calcScore = (stones: StoneId[]) => (
    stones.reduce((prev, curr) => {
        switch (curr[0]) {
            case "s":
                return prev + 3
            case "e":
                return prev + 2
            case "a":
                return prev + 1
            default:
                return prev
        }
    }, 0)
)
