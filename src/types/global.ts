import { Fill } from "./fills"
import { Order } from "./orders"

/** True (no transformation needed), "drop" (pop one value), "insert-zero" (push one '0' value) */
export type Transformation = true | "drop" | "insert-zero"

export type CSVSource = {
    filename: string
    transformation: readonly Transformation[]
    schema: readonly string[]
}

export type DataObject = {
    orders: Order[]
    fills: Fill[]
    sets: {
        categories: Set<string>
        currencies: Set<string>
        symbols: Set<string>
        activeSymbols: Set<string>
        years: Set<number>
    }
}

export type ConfigMultiplier = { matcher: string; multiplier: number }

export type Env = {
    data: DataObject
    logging: boolean
    errors: string[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log: (...args: any) => void
    table: (...args: object[]) => void
    error: (description: string, critical?: boolean) => void
    flushErrors: () => void
}
