import { env } from "../env"
import { Order } from "../types/orders"
import { DisplayRetyped } from "../types/utilities"
import { fixed, getUserENTERInput, makeObjectFixedDashed } from "../utils"
import { ViewGenerator } from "./definitions"

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

    env.table(fullTable)

    for (const key in totalPnl) totalPnl[key] = fixed(totalPnl[key])
    totalTax = fixed(totalTax)

    env.log("Total P&L:", totalPnl)
    env.log("Total tax:", totalTax)
}

const realizedTax = async () => {
    env.log("\nRealized Tax view launched. " + ">>>".repeat(40))

    env.log("\nTable = one year.")
    env.log("Row = filled orders, sorted by date.")

    for (const y of env.data.sets.years) {
        env.log(`\n[Realized Tax] ${y} `)

        const orderSlice = env.data.orders.filter((o) => o.datetime.getFullYear() === y)

        realizedTaxOneYear(orderSlice)

        if (!(await getUserENTERInput("for next year"))) break
    }
}

export function* realizedTaxGenerator(): ViewGenerator {
    for (const y of env.data.sets.years) {
        yield

        env.log(`\n[Realized Tax] ${y} `)

        const orderSlice = env.data.orders.filter((o) => o.datetime.getFullYear() === y)

        realizedTaxOneYear(orderSlice)
    }
}

export default realizedTax
