import { TAX_BRACKET } from "../config/config"
import { env } from "../env"
import { DisplayRetyped } from "../types/utilities"
import { fixed, getDateDiffDisplay, getPriceBySymbol, getUserENTERInput, makeObjectFixedDashed } from "../utils"

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
    env.table(totals.map((t) => makeObjectFixedDashed<ViewTotal>(t)))
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
    const opens: DisplayRetyped<ViewOrder>[] = []

    const unfilledOrders = env.data.orders.filter((o) => o.quantity !== o.filled)
    for (const o of unfilledOrders) {
        const q = o.quantity - o.filled
        const m = q / o.quantity
        const mtmPrice = getPriceBySymbol(o.symbol)

        opens.push(
            makeObjectFixedDashed<ViewOrder>({
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
        )
    }

    // Sort
    opens.sort((a, b) => (a.symbol as string).localeCompare(b.symbol as string))

    env.table(opens)
}

const openView = async () => {
    env.log("\nOpen Positions view launched. " + ">>>".repeat(40))

    env.log("\nOpen positions (total)")
    env.log("\nRow = one symbol (with at least 1 unfilled order).")
    env.log("Notes: every row sums over all unfilled or partially unfilled orders of the symbol.")
    openViewTotals()

    if (await getUserENTERInput("for breakdown into open orders")) {
        env.log("\nOpen positions (by order)")
        env.log("\nRow = one unfilled order, sorted by symbol then date.")
        env.log("Notes: values proportional to unfilled part.")
        openViewOrders()
    }
}

export default openView
