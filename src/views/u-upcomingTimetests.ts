import { TAX_BRACKET } from "../config/config"
import { env } from "../env"
import { Order } from "../types/orders"
import { DisplayRetyped } from "../types/utilities"
import { makeObjectFixedDashed, getPriceBySymbol, getDatePlus3y, getDateDiffDisplay, getDateDiff } from "../utils"
import { ViewGenerator } from "./definitions"

type View = {
    symbol: string

    since: string // open order date
    finished: string // open order + 3y
    remains: string // open order + 3y - today

    quantity: number

    basisPrice: number
    basis: number

    mtmPrice: number
    mtmValue: number

    unrlzd: number
    tax: number
}

const getTimetest = (o: Order) => {
    const mtmPrice = getPriceBySymbol(o.symbol)

    const q = o.quantity - o.filled
    const m = q / o.quantity

    const mtmValue = mtmPrice * q
    const unrlzd = mtmPrice * q - o.basis * m
    const tax = unrlzd * TAX_BRACKET

    return makeObjectFixedDashed<View>({
        symbol: o.symbol,

        since: o.datetime.toLocaleDateString(),
        finished: getDatePlus3y(o.datetime).toLocaleDateString(),
        remains: getDateDiffDisplay(new Date(), getDatePlus3y(o.datetime)),

        quantity: q,

        basisPrice: o.tprice,
        basis: o.basis * m,

        mtmPrice: mtmPrice,
        mtmValue: mtmValue,

        unrlzd: unrlzd,
        tax: tax,
    })
}

export function* upcomingTimetestsView(): ViewGenerator {
    const orderSlice = env.data.orders.filter((o) => o.quantity !== o.filled)
    orderSlice.sort((a, b) => getDateDiff(b.datetime, a.datetime))

    const timetests: DisplayRetyped<View>[] = []
    for (const o of orderSlice) {
        timetests.push(getTimetest(o))
    }

    yield {
        table: timetests,
        isLast: true,
    }
}

export default upcomingTimetestsView
