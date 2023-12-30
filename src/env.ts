import { Env } from "./types/global"
import { delay } from "./utils"

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
      delay()
    }
  },

  table: (...args) => {
    if (process.env["LOGGING"]) {
      console.table(...args)
      delay()
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
