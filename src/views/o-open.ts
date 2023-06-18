import { TAX_BRACKET } from "../config/config"
import { env } from "../env"
import { ViewDefinition, ViewGenerator } from "../types/views"
import { fixed, getDateDiffDisplay, getPriceBySymbol } from "../utils"

///////////////////////////// Totals

type ViewTotal = {
    symbol: string
    quantity: number
    basisPrice: number
    basis: number

    mtmPrice: number
    mtmValue: number

    unrlzd: number
    unrlzdpp: string
}

const openViewTotals = () => {
    // Check total open positions
    const totals: ViewTotal[] = []

    // Setup data
    const unfilledOrders = env.data.orders.filter((o) => o.quantity !== o.filled)
    for (const o of unfilledOrders) {
        let index = totals.findIndex((t) => t.symbol === o.symbol)

        if (index === -1) {
            // initialize new object
            totals.push({
                symbol: o.symbol,
                quantity: 0,
                basisPrice: 0,
                basis: 0,

                mtmPrice: 0,
                mtmValue: 0,

                unrlzd: 0,
                unrlzdpp: "0 %",
            })
            index = totals.length - 1
        }

        // Add unfilled quantity and basis
        const unfilled = o.quantity - o.filled
        totals[index].quantity += unfilled
        totals[index].basis += o.tprice * unfilled + o.commfee * (unfilled / o.quantity)
    }

    // Consolidate data
    for (const t of totals) {
        t.basisPrice = t.basis / t.quantity

        t.mtmPrice = getPriceBySymbol(t.symbol)
        t.mtmValue = t.mtmPrice * t.quantity

        t.unrlzd = t.mtmValue - t.basis
        t.unrlzdpp = fixed((t.unrlzd / Math.abs(t.basis)) * 100) + " %"
    }

    // Display results
    return totals
}

///////////////////////////// Orders

type ViewOrder = {
    since: string
    symbol: string
    quantity: number
    partFill: boolean

    basisPrice: number
    basis: number

    mtmPrice: number
    mtmValue: number

    unrlzd: number
    timetest: string
    tax: number
}

const openViewOrders = () => {
    // Check open positions by order
    const opens: ViewOrder[] = []

    const unfilledOrders = env.data.orders.filter((o) => o.quantity !== o.filled)
    for (const o of unfilledOrders) {
        const q = o.quantity - o.filled
        const m = q / o.quantity
        const mtmPrice = getPriceBySymbol(o.symbol)

        opens.push({
            since: o.datetime.toLocaleDateString(),
            symbol: o.symbol,
            quantity: q,
            partFill: o.filled !== 0,

            basisPrice: o.tprice,
            basis: o.basis * m,

            mtmPrice: mtmPrice,
            mtmValue: mtmPrice * q,

            unrlzd: mtmPrice * q - o.basis * m,
            timetest: getDateDiffDisplay(o.datetime, new Date()),
            tax: (mtmPrice * q - o.basis * m) * TAX_BRACKET,
        })
    }

    // Sort
    opens.sort((a, b) => (a.symbol as string).localeCompare(b.symbol as string))

    return opens
}

function* openPositionsView(): ViewGenerator<ViewTotal | ViewOrder> {
    yield {
        table: openViewTotals(),
        isLast: false,
    }

    env.log("\nOpen positions (by order)")
    env.log("\nRow = one unfilled order, sorted by symbol then date.")
    env.log("Notes: values proportional to unfilled part.")

    yield {
        table: openViewOrders(),
        isLast: true,
    }
}

const viewDefinition: ViewDefinition<ViewTotal | ViewOrder> = {
    name: "Open Positions",
    command: "o",
    generator: openPositionsView,
    description: {
        table: "Open positions (total)",
        row: "one symbol (with at least 1 unfilled order)",
        notes: ["every row sums over all unfilled or partially unfilled orders of the symbol."],
    },
    screenplay: {
        nextTableMessage: "for breakdown into open orders",
    },
}

export default viewDefinition
