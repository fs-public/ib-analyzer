import { env } from "../env"
import { DisplayRetyped } from "../types/global"
import { Order } from "../types/trades"
import { ViewGenerator } from "../types/views"
import { fixed, isValueLastInSet, makeObjectFixedDashed } from "../utils"

type View = {
    date: string
    symbol: string
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

const getOrderView = (order: Order) => {
    return makeObjectFixedDashed<View>({
        date: order.datetime.toLocaleDateString(),
        symbol: order.symbol,
        quantity: order.quantity,
        tprice: order.tprice,
        basis: order.basis,
        proceeds: order.proceeds,
        commfee: order.commfee,
        realizedpl: order.realizedpl,
        timetest: "-",
        tax: order.tax,
        codes: order.code + `; filled-${order.quantity === order.filled ? "all" : order.filled}`,
    })
}

const realizedTaxOneYear = (orders: Order[]) => {
    const fullTable: DisplayRetyped<View>[] = []

    const totalPnl: { [key: string]: number } = {}
    for (const cur of Array.from(env.data.sets.currencies)) totalPnl[cur] = 0

    let totalTax = 0

    for (const o of orders) {
        if (o.action.includes("close") || o.tax !== 0) {
            fullTable.push(getOrderView(o))

            totalPnl[o.currency] += o.realizedpl
            totalTax += o.tax
        }
    }

    for (const key in totalPnl) totalPnl[key] = fixed(totalPnl[key])
    totalTax = fixed(totalTax)

    return {
        table: fullTable,
        printMoreStats: () => {
            env.log("Total P&L:", totalPnl)
            env.log("Total tax:", totalTax)
        },
    }
}

export function* realizedTaxView(): ViewGenerator {
    for (const y of env.data.sets.years) {
        const orderSlice = env.data.orders.filter((o) => o.datetime.getFullYear() === y)

        yield {
            isLast: isValueLastInSet(y, env.data.sets.years),
            title: String(y),
            ...realizedTaxOneYear(orderSlice),
        }
    }
}

export default realizedTaxView
