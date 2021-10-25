import { makeAutoObservable } from "mobx"
import { useRef } from "react"

export const useAutoObservable = <T extends object>(
    target: T,
    overrides?: Partial<{ [K in keyof T]: boolean }>,
): T => (
    useRef(makeAutoObservable<T>(target, overrides)).current
)
