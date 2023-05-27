import { Fill } from "./fills"
import { Order } from "./orders"

export type CsvSource = {
    filename: string
    reschemeRequired: boolean
    transformation: (string | boolean)[]
    schema: string[]
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
    log: (...args: any) => void
    table: (...args: any) => void
    error: (description: string, critical?: boolean) => void
    flushErrors: () => void
}
