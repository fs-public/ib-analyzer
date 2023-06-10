import { env } from "../env"
import { DisplayRetyped } from "../types/global"
import { Order, Fill } from "../types/trades"
import { ViewGenerator } from "../types/views"
import { isValueLastInSet, makeObjectFixedDashed, millisecondsToString } from "../utils"

type View = {
    id: number // id for orders, relating id for fills
    date: string
    action: string
    quantity: number
    tprice: string | number
    basis: string | number
    proceeds: string | number
    commfee: string | number
    realizedpl: string | number
    timetest: string
    tax: string | number
    codes: string
}

const getOneOrder = (order: Order, fills: Fill[]) => {
    const orderTable = makeObjectFixedDashed<View>(
        {
            id: order.id,
            date: order.datetime.toLocaleDateString(),
            action: order.action,
            quantity: order.quantity,
            tprice: order.tprice,
            basis: order.basis,
            proceeds: order.proceeds,
            commfee: order.commfee,
            realizedpl: order.realizedpl,
            timetest: "-",
            tax: order.tax,
            codes: order.code + `; filled-${order.quantity === order.filled ? "all" : order.filled}`,
        },
        ["id"]
    )

    const fillsTable = fills.map((f) => {
        return makeObjectFixedDashed<View>(
            {
                //"[op,cl,this]": [f.openId, f.closeId, f.thisFillIdPerClose],
                id: -f.openId,
                date: "^",
                action: "fill",
                quantity: f.quantity,
                tprice: "-",
                basis: f.basis,
                proceeds: f.proceeds,
                commfee: f.commfee,
                realizedpl: f.realizedpl,
                timetest: millisecondsToString(f.timetest),
                tax: f.tax,
                codes: "",
            },
            ["id"]
        )
    })

    return [orderTable, ...fillsTable]
}

export function* historicalView(): ViewGenerator {
    for (const sym of env.data.sets.symbols) {
        const orderSlice = env.data.orders.filter((o) => o.symbol === sym)

        let symbolTable: DisplayRetyped<View>[] = []

        for (const o of orderSlice) {
            const relatingFills = env.data.fills.filter((f) => f.symbol === sym && f.closeId === o.id)

            symbolTable = [...symbolTable, ...getOneOrder(o, relatingFills)]
        }

        yield {
            isLast: isValueLastInSet(sym, env.data.sets.symbols),
            title: sym,
            table: symbolTable,
        }
    }
}

export default historicalView
