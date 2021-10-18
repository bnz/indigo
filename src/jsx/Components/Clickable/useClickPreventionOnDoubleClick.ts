import { useCancellablePromises } from "./useCancellablePromises"
import { cancellablePromise } from "./cancellablePromise"

const delay = (n: number) => new Promise((resolve) => setTimeout(resolve, n))

type UseClickPreventionOnDoubleClick = (
    onClick: ((e: any) => void) | undefined,
    onDoubleClick: ((e: any) => void) | undefined,
) => [() => void, () => void]

export const useClickPreventionOnDoubleClick: UseClickPreventionOnDoubleClick = (onClick, onDoubleClick) => {
    const api = useCancellablePromises()

    return [
        () => {
            api.clearPendingPromises()
            const waitForClick = cancellablePromise(delay(300))
            api.appendPendingPromise(waitForClick)

            return waitForClick.promise
                .then(() => {
                    api.removePendingPromise(waitForClick)
                    if (onClick) {
                        onClick(undefined)
                    }
                })
                .catch((errorInfo: any): void => {
                    api.removePendingPromise(waitForClick)
                    if (!errorInfo.isCanceled) {
                        throw errorInfo.error
                    }
                })
        },
        () => {
            api.clearPendingPromises()
            if (onDoubleClick) {
                onDoubleClick(undefined)
            }
        },
    ]
}
