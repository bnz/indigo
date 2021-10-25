import { makeObservable } from "mobx"
import { useRef } from "react"

export const useObservable = <T extends object>(
    target: T,
    annotations?: Partial<{ [K in keyof T]: boolean }>,
): T => (
    useRef(makeObservable<T>(target, annotations)).current
)
