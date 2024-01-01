import { env } from "../../env"
import { Order, Fill } from "../../types/trades"
import { GeneratedView, ViewDefinition } from "../../types/views"
import { millisecondsToString } from "../../utils"

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
  const orderRow: View = {
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
    codes: order.code + `|filled-${order.quantity === order.filled ? "all" : order.filled}`,
  }

  const fillRows: View[] = fills.map((f) => ({
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
  }))

  return [orderRow, ...fillRows]
}

export function historicalViewFn(search?: string, activeSymbolsOnly?: boolean) {
  const results: GeneratedView<View>[] = []

  for (const sym of activeSymbolsOnly ? env.data.sets.activeSymbols : env.data.sets.symbols) {
    if (search && !sym.toLowerCase().includes(search.toLowerCase())) continue

    const orderSlice = env.data.orders.filter((o) => o.symbol === sym)

    let symbolTable: View[] = []

    for (const o of orderSlice) {
      const relatingFills = env.data.fills.filter((f) => f.symbol === sym && f.closeId === o.id)

      symbolTable = [...symbolTable, ...getOneOrder(o, relatingFills)]
    }

    results.push({
      title: sym,
      table: symbolTable,
    })
  }

  return results
}

const viewDefinition: ViewDefinition<View> = {
  name: "Historical Analysis (Verbose)",
  command: "h [search]",
  generateView: historicalViewFn,
  description: {
    table: "one symbol",
    row: "orders and fills (consolidated), sorted by date",
    notes: ["fills (present for close orders) sum to the order just above it."],
  },
  screenplay: {
    nextTableMessage: "for next symbol",
  },
}

export default viewDefinition
