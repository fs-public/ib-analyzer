import { Env } from "./types/global"

const slowIfNeeded = () => {
    if (!process.env["SLOW_LOGGING"]) return

    let count = 0
    for (let i = 0; i < 100_000_000; i++) {
        count += i * i
    }
    return count
}

export const env: Env = {
    data: {
        orders: [],
        fills: [],
        sets: {
            categories: new Set(),
            currencies: new Set(),
            symbols: new Set(),
            activeSymbols: new Set(),
            years: new Set(),
        },
    },

    errors: [],

    log: (...args) => {
        if (process.env["LOGGING"]) {
            console.log(...args)
            slowIfNeeded()
        }
    },

    table: (...args) => {
        if (process.env["LOGGING"]) {
            console.table(...args)
            slowIfNeeded()
        }
    },

    error: (description, critical = false) => {
        if (critical) throw new Error(description)
        else env.errors.push(description)
    },

    flushErrors: () => {
        env.errors = []
    },
}
