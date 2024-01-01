import { env } from "../../env"
import { Order } from "../../types/trades"
import { ViewDefinition, GeneratedView } from "../../types/views"
import { fixed, getCurrencyBySymbol } from "../../utils"

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
  return {
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
    codes: order.code + `|filled-${order.quantity === order.filled ? "all" : order.filled}`,
  }
}

const realizedTaxOneYear = (orders: Order[]): Omit<GeneratedView<View>, "title"> => {
  const fullTable: View[] = []

  const totalPnl: { [key: string]: number } = {}
  for (const cur of Array.from(env.data.sets.currencies)) totalPnl[cur] = 0

  let totalTax = 0

  for (const o of orders) {
    if (o.action.includes("close") || o.tax !== 0) {
      fullTable.push(getOrderView(o))

      totalPnl[o.currency] += o.realizedpl
      totalTax += o.tax * getCurrencyBySymbol(o.symbol)
    }
  }

  for (const key in totalPnl) totalPnl[key] = fixed(totalPnl[key])
  totalTax = fixed(totalTax)

  return {
    table: fullTable,
    additionalContentAfter: `Total P&L: ${JSON.stringify(totalPnl)}\nTotal tax: ${totalTax} CZK`,
  }
}

function realizedTaxView() {
  const results: GeneratedView<View>[] = []

  for (const y of env.data.sets.years) {
    const orderSlice = env.data.orders.filter((o) => o.datetime.getFullYear() === y)

    results.push({
      title: String(y),
      ...realizedTaxOneYear(orderSlice),
    })
  }

  return results.reverse()
}

const viewDefinition: ViewDefinition<View> = {
  name: "Realized Tax",
  command: "r",
  generateView: realizedTaxView,
  description: {
    table: "one year",
    row: "filled orders, sorted by date",
    notes: [],
  },
  screenplay: {
    nextTableMessage: "for next year",
  },
}

export default viewDefinition
