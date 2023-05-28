import { SchemedRecord } from "../types/records"

export const DATA_BASE_DIR = "data/"

export const TAX_BRACKET = 0.15

const HARVEST_COMM = 10 // 10 USD or EUR
const HARVEST_COMM_BASE = 500 // ^ for every 500 shares
const HARVEST_SLIPPAGE = 0.001 // 0.1%

// Asset Categories

export enum ASSET_CATEGORIES {
    STOCKS = "Stocks",
    DERIVATIVE_OPTIONS = "Equity and Index Options",
    FUTURES = "Futures",
}

// Codes

enum TO_DROP_ORDER {
    FRACTIONAL_PORTION_AGENT = "FPA",
}

enum RECOGNIZED {
    OPEN = "O",
    CLOSE = "C",
    IB_IRRELEVANT_PARTIAL = "P",
}

enum CUSTOM {
    TIMETEST_PASSED = "TP",
}

export const CODES = {
    TO_DROP_ORDER,
    RECOGNIZED,
    CUSTOM,
}

// Utils

// Use with caution.
export const shouldDropSpecificRecord = (record: SchemedRecord): boolean => {
    return record[5] === "SYMBOL_EXEMPT_FROM_ANALYSIS"
}

export const getHarvestLoss = (quantity: number, value: number) => {
    const numOrders = Math.ceil(Math.abs(quantity) / HARVEST_COMM_BASE)
    return 2 * (numOrders * HARVEST_COMM + Math.abs(value) * HARVEST_SLIPPAGE)
}

export const HELP_STRING = `
Interactive Brokers Analyzer - Interactive Wizard
fs-public, 2023

Admin Commands:
  - reload: reload
  - i, issues: issues print
  - example: example order print
  - help: help print
  - q, quit: quit

Views:
  - h: historical analysis (verbose)
  - l: loss harvest
  - o: open positions
  - r: realized tax
  - u: upcoming timetests`
