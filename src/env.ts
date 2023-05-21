import { Env } from "./types"

export const env:Env = {
    data: {
        orders: [],
        fills: [],
        sets: {
            categories: new Set(),
            currencies: new Set(),
            symbols: new Set(),
            activeSymbols: new Set(),
            years: new Set(),
        }
    },
    
    logging: true,
    errors: [],

    log: (...args) => {
        if(env.logging)
            console.log(...args)
    },

    table: (...args) => {
        if(env.logging)
            console.table(...args)
    },

    error: (description, critical = false) => {
        if(critical)
            throw new Error(description)
        else
            env.errors.push(description)
    },

    flushErrors: () => {
        env.errors = []
    }
}
