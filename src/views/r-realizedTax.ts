import { env } from "../env"
import { Order } from "../types"
import { fixed, getUserENTERInput, makeObjectFixedDashed } from "../utils"

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

const getOrderView = (order: Order): View => {
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
    let fullTable: View[] = []

    const totalPnl: { [key: string]: number } = {}
    for (let cur of Array.from(env.data.sets.currencies)) totalPnl[cur] = 0

    let totalTax = 0

    for (let o of orders) {
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

// @ts-ignore
const realizedTax = async () => {
    env.log("\nRealized Tax view launched. " + ">>>".repeat(40))

    env.log("\nTable = one year.")
    env.log("Row = filled orders, sorted by date.")

    // @ts-ignore
    for (let y of env.data.sets.years) {
        env.log(`\n[Realized Tax] ${y} `)

        const orderSlice = env.data.orders.filter((o) => o.datetime.getFullYear() === y)

        realizedTaxOneYear(orderSlice)

        if (!(await getUserENTERInput("for next year"))) break
    }
}

export default realizedTax
