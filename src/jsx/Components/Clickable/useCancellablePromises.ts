import { useRef } from "react"
import { CancellablePromise } from "./cancellablePromise"

type UseCancellablePromises = () => {
    appendPendingPromise: (promise: CancellablePromise) => void
    removePendingPromise: (promise: CancellablePromise) => void
    clearPendingPromises: () => void
}

export const useCancellablePromises: UseCancellablePromises = () => {
    const pendingPromises = useRef<CancellablePromise[]>([])

    return {
        appendPendingPromise(promise) {
            pendingPromises.current = [...pendingPromises.current, promise]
        },
        removePendingPromise(promise) {
            pendingPromises.current = pendingPromises.current.filter((p) => p !== promise)
        },
        clearPendingPromises() {
            pendingPromises.current.forEach((p) => p.cancel())
        },
    }
}
