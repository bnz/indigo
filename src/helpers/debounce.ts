export function debounce(func: any, wait: any) {
  let timeout: any

  return function(...args: any[]) {
    // @ts-ignore
    const context = this
    const later = function() {
      timeout = null
      func.apply(context, args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
