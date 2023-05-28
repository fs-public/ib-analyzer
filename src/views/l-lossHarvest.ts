import { getHarvestLoss, TAX_BRACKET } from "../config/config"
import { env } from "../env"
import { Order } from "../types/orders"
import { DisplayRetyped } from "../types/utilities"
import { getDateDiffDisplay, getPriceBySymbol, getUserENTERInput, makeObjectFixedDashed } from "../utils"
import { ViewGenerator } from "./definitions"

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
    const harvests: DisplayRetyped<View>[] = []

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

        harvests.push(
            makeObjectFixedDashed<View>({
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
        )
    }

    env.table(harvests)
}

export const lossHarvestView = async () => {
    env.log("\nLoss Harvest analysis launched. " + ">>>".repeat(40))

    env.log("\nTable = one symbol.")
    env.log("Row = unfilled orders, sorted by date.")
    env.log("Notes: partially filled orders are displayed proportionately to unfilled part.")

    for (const sym of env.data.sets.symbols) {
        const mtmPrice = getPriceBySymbol(sym)

        const orderSlice = env.data.orders.filter((o) => o.symbol === sym && o.quantity !== o.filled)

        if (orderSlice.length > 0) {
            env.log(`\n[Loss Harvest] ${sym} at current price`, mtmPrice)

            lossHarvestOneSymbol(orderSlice, mtmPrice)

            if (!(await getUserENTERInput("for next symbol"))) break
        }
    }

    env.log("Completed.")
}

export function* lossHarvestViewGenerator(): ViewGenerator {
    for (const sym of env.data.sets.symbols) {
        const mtmPrice = getPriceBySymbol(sym)

        const orderSlice = env.data.orders.filter((o) => o.symbol === sym && o.quantity !== o.filled)

        if (orderSlice.length > 0) {
            yield

            env.log(`\n[Loss Harvest] ${sym} at current price`, mtmPrice)
            lossHarvestOneSymbol(orderSlice, mtmPrice)
        }
    }
}

export default lossHarvestView
