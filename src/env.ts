import { Env } from "./types/global"

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

  log: (...args) => console.log(...args),

  table: (...args) => console.table(...args),

  error: (description, critical = false) => {
    if (critical) throw new Error(description)
    else env.errors.push(description)
  },

  flushErrors: () => {
    env.errors = []
  },
}
