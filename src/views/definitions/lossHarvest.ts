import { getHarvestLoss, TAX_BRACKET } from "../../config/config"
import { env } from "../../env"
import { Order } from "../../types/trades"
import { ViewDefinition, GeneratedView } from "../../types/views"
import { getDateDiffDisplay, getPriceBySymbol } from "../../utils"

type View = {
    since: string
    quantity: number

    basisPrice: number
    basis: number

    mtmValue: number

    unrlzd: number
    timetest: string
    tax: number

    cumUnrlzd: number
    cumValue: number
    cumTax: number
    slipLoss: number
}

type RunningCumulative = {
    cumQuantity: number
    cumUnrlzd: number
    cumValue: number
    cumTax: number
}

const lossHarvestOneSymbol = (orders: Order[], mtmPrice: number) => {
    const harvests: View[] = []

    const cum: RunningCumulative = {
        cumQuantity: 0,
        cumUnrlzd: 0,
        cumValue: 0,
        cumTax: 0,
    }

    for (const o of orders) {
        const q = o.quantity - o.filled
        const m = q / o.quantity

        const mtmValue = mtmPrice * q
        const unrlzd = mtmPrice * q - o.basis * m
        const tax = unrlzd * TAX_BRACKET

        cum.cumQuantity += q
        cum.cumUnrlzd += unrlzd
        cum.cumValue += mtmValue
        cum.cumTax += tax

        harvests.push({
            since: o.datetime.toLocaleDateString(),
            quantity: q,

            basisPrice: o.tprice,
            basis: o.basis * m,

            mtmValue: mtmValue,

            unrlzd: unrlzd,
            timetest: getDateDiffDisplay(o.datetime, new Date()),
            tax: tax,

            cumUnrlzd: cum.cumUnrlzd,
            cumValue: cum.cumValue,
            cumTax: cum.cumTax,
            slipLoss: -getHarvestLoss(cum.cumQuantity, cum.cumValue),
        })
    }

    return harvests
}

function lossHarvestView() {
    const results: GeneratedView<View>[] = []

    for (const sym of env.data.sets.symbols) {
        const mtmPrice = getPriceBySymbol(sym)

        const orderSlice = env.data.orders.filter((o) => o.symbol === sym && o.quantity !== o.filled)

        if (orderSlice.length > 0) {
            results.push({
                title: `${sym} at current price ${mtmPrice}`,
                table: lossHarvestOneSymbol(orderSlice, mtmPrice),
            })
        }
    }

    return results
}

const viewDefinition: ViewDefinition<View> = {
    name: "Loss Harvest",
    command: "l",
    generateView: lossHarvestView,
    description: {
        table: "one symbol",
        row: "unfilled orders, sorted by date",
        notes: ["partially filled orders are displayed proportionately to unfilled part."],
    },
    screenplay: {
        nextTableMessage: "for next symbol",
    },
}

export default viewDefinition
