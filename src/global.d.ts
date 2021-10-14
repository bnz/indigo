declare global {
    type Dictionary<K extends string, T> = { [P in K]?: T }
}
