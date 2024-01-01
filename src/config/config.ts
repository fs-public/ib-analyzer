import { SchemedRecord } from "../types/trades"
import { Views } from "../views/definitions"

export const PATHS = {
  DATA_DIR: "data",
  OUTPUT_DIR: "output",
  PERSONAL_DATASOURCES: "data/personal-datasources.json",
  PERSONAL_DATASOURCE_FALLBACK: "example/personal-datasources.json",
}

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
  OPEN = "O|Opening order",
  CLOSE = "C|Closing order",
  IB_IRRELEVANT_PARTIAL = "P|Partial fill, irrelevant code",
  OPTION_EXPIRED = "Ep|Option expired (expired position)",
  OPTION_EXERCISED = "Ex|Option exercised",
}

enum CUSTOM {
  FILL_AMOUNT = 'filled-<"all"|number>|Amount of filled shares',
  TIMETEST_PASSED = "TP|Timetest has passed",
}

export const CODES = {
  TO_DROP_ORDER,
  RECOGNIZED,
  CUSTOM,
}

// Utils

/**
 * Use with caution.
 */
export const shouldDropSpecificRecord = (record: SchemedRecord): boolean => {
  return record[5] === "SYMBOL_EXEMPT_FROM_ANALYSIS"
}

export const getHarvestLoss = (quantity: number, value: number) => {
  const numOrders = Math.ceil(Math.abs(quantity) / HARVEST_COMM_BASE)
  return 2 * (numOrders * HARVEST_COMM + Math.abs(value) * HARVEST_SLIPPAGE)
}

const helpStringIterator = <T>(obj: { [key: string]: T }, fn: (arg: T) => string) =>
  Object.values(obj)
    .map((val) => `  - ${fn(val)}`)
    .join("\n")

export const HELP_STRING = `Interactive Brokers Analyzer - Interactive Wizard
fs-public, 2023-2024

Admin Commands:
  - reload: reload
  - i: issues print
  - e: export all views to CSV
  - p: export all views to PDF
  - dataformat: print an example order and fill
  - help: show help (this message)
  - codes: explain used code flags
  - q, quit: quit

Views:
${helpStringIterator(Views, (view) => `${view.command}: ${view.name.toLowerCase()}`)}
`

export const HELP_CODES = `
Orders have helpful codes, exported both by IB and custom codes computed by us. These codes are found, for example, in
historical and realized tax views, as rows in these views display orders (transactions).
Every transaction has codes in format <IB exported>|<custom>.

Recognized codes (taken from IB export, but verified)
${helpStringIterator(CODES.RECOGNIZED, (code) => code.replace("|", ": "))}

Custom codes
${helpStringIterator(CODES.CUSTOM, (code) => code.replace("|", ": "))}
`
