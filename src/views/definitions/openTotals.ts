import { env } from "../../env"
import { ViewDefinition, GeneratedView } from "../../types/views"
import { fixed, getPriceBySymbol } from "../../utils"

type View = {
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
    const totals: View[] = []

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

function openPositionsTotalsView() {
    const results: GeneratedView<View> = {
        title: "Open totals",
        table: openViewTotals(),
    }

    return [results]
}

const viewDefinition: ViewDefinition<View> = {
    name: "Open Positions",
    command: "o",
    generateView: openPositionsTotalsView,
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
