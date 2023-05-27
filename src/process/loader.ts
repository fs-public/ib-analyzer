import { SchemedRecord } from "../types/records"
import { env } from "../env"
import loadData from "./1-loadData"
import parseOrders from "./2-parseOrders"
import matchFills from "./3-matchFills"
import { validatorRecords, validatorOrders, validatorFills } from "./4-validator"
import { CSV_SOURCES } from "../config/sources"

export const performFullReload = async (firstLoad = false) => {
    if (!firstLoad) env.flushErrors()

    // Import CSV and fix old imports
    const records: SchemedRecord[] = await loadData()

    // Validate records
    validatorRecords(records)

    // Setup orders
    const orders = parseOrders(records)

    // Fill out sets
    const categories = new Set(orders.map((o) => o.assetcategory))
    const currencies = new Set(orders.map((o) => o.currency))
    const symbols = new Set(orders.map((o) => o.symbol))
    const years = new Set(orders.map((o) => o.datetime.getFullYear()))

    // Print out stats

    // Validate orders
    validatorOrders(orders)

    // Compute and validate fills
    const fills = matchFills(orders, symbols)

    // Validate fills
    validatorFills(orders)

    // Finish sets and print stats
    const activeSymbols = new Set(orders.filter((o) => o.quantity !== o.filled).map((o) => o.symbol))

    env.log(
        `Loaded ${CSV_SOURCES.length} CSVs with total`,
        orders.length,
        `trades (filtered from ${records.length} records).\n`
    )

    env.log("Categories", categories.size, "\b:", Array.from(categories))
    env.log("Currencies", currencies.size, "\b:", Array.from(currencies))
    env.log("Symbols", symbols.size, "\b:", [...Array.from(symbols).slice(0, 4), "..."])
    env.log("Active symbols", activeSymbols.size, "\b:", [...Array.from(activeSymbols).slice(0, 4), "..."])
    env.log("Years", years.size, "\b:", Array.from(years))
    env.log("Issues:", env.errors.length)

    // Return
    env.data = {
        orders,
        fills,
        sets: {
            categories,
            currencies,
            symbols,
            activeSymbols,
            years,
        },
    }
}
