import { getUserInput } from "./utils"

import { SchemedRecord } from "./types"
import { env } from "./env"

import loader from "./process/1-loader"
import parseOrders from "./process/2-parseOrders"
import matchFills from "./process/3-matchFills"
import { validatorRecords, validatorOrders, validatorFills } from "./process/4-validator"

import historicalView from "./views/h-historical"
import realizedTax from "./views/r-realizedTax"
import openView from "./views/o-open"
import lossHarvestView from "./views/l-lossHarvest"
import { HELP_STRING } from "./config/config"
import upcomingTimetestsView from "./views/u-upcomingTimetests"
import { CSV_SOURCES } from "./config/sources"

const reload = async () => {
    env.flushErrors()

    // Import CSV and fix old imports
    const records: SchemedRecord[] = await loader()

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

    // Validate filss
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

const main = async () => {
    env.log("IB analyzer running...")

    //////////////////////////// RUN 'r h' for user

    await reload()

    env.log(HELP_STRING)

    //////////////////////////// MAIN LOOP

    let quit = false
    while (!quit) {
        const command = await getUserInput(">> ")

        switch (command) {
            // Admin
            case "reload":
                await reload()
                break
            case "i":
            case "issues":
                env.log(env.errors)
                break
            case "example":
                env.log("\nTypical order:")
                env.log(env.data.orders[0])
                break
            case "help":
                env.log(HELP_STRING)
                break
            case "q":
            case "quit":
                quit = true
                break
            // Views
            case "h":
                await historicalView()
                break
            case "l":
                await lossHarvestView()
                break
            case "o":
                await openView()
                break
            case "r":
                await realizedTax()
                break
            case "u":
                await upcomingTimetestsView()
                break
            // Default
            default:
                env.log("Unrecognized command.")
        }
    }
}

main()
