export const DATA_BASE_DIR = "data/"

export const TAX_BRACKET = 0.15

const HARVEST_COMM = 10 // 10 USD or EUR
const HARVEST_COMM_BASE = 500 // ^ for every 500 shares
const HARVEST_SLIPPAGE = 0.001 // 0.1%

export const getHarvestLoss = (quantity: number, value: number) => {
    const numOrders = Math.ceil(Math.abs(quantity) / HARVEST_COMM_BASE)
    return 2 * (numOrders * HARVEST_COMM + Math.abs(value) * HARVEST_SLIPPAGE)
}

export const HELP_STRING = `
Interactive Brokers Analyzer
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
