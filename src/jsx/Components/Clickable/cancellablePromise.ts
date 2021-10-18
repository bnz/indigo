export type CancellablePromise = {
    promise: Promise<unknown>
    cancel: () => void
}

export const cancellablePromise = (promise: Promise<unknown>): CancellablePromise => {
    let isCanceled = false

    return {
        promise: new Promise((resolve, reject) => {
            promise.then(
                (value) => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
                (error) => reject({ isCanceled, error }),
            )
        }),
        cancel() {
            isCanceled = true
        },
    }
}
