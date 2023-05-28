import { SchemedRecord } from "../types/records"
import { env } from "../env"
import { CSV_SOURCES } from "../config/sources"
import loadData from "./1-loadData"
import parseOrders from "./2-parseOrders"
import matchFills from "./3-matchFills"
import { validatorRecords, validatorOrders, validatorFills } from "./4-validator"

export const performFullReload = async (firstLoad = false) => {
    if (!firstLoad) env.flushErrors()

    // Load CSV data as records and validate
    const records: SchemedRecord[] = await loadData()
    validatorRecords(records)

    // Parse and validate orders
    const orders = parseOrders(records)
    validatorOrders(orders)

    // Fill out sets
    const categories = new Set(orders.map((o) => o.assetcategory))
    const currencies = new Set(orders.map((o) => o.currency))
    const symbols = new Set(orders.map((o) => o.symbol))
    const years = new Set(orders.map((o) => o.datetime.getFullYear()))

    // Compute and validate fills
    const fills = matchFills(orders, symbols)
    validatorFills(fills, orders)

    // Finish sets
    const activeSymbols = new Set(orders.filter((o) => o.quantity !== o.filled).map((o) => o.symbol))

    // Print out stats
    env.log("Loaded", CSV_SOURCES.length, "CSVs with total of", orders.length, "trades.\n")

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
