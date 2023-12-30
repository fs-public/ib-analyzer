import { TAX_BRACKET } from "../../config/config"
import { env } from "../../env"
import { ViewDefinition, GeneratedView } from "../../types/views"
import { getDateDiffDisplay, getPriceBySymbol } from "../../utils"

type View = {
  since: string
  symbol: string
  quantity: number
  partFill: boolean

  basisPrice: number
  basis: number

  mtmPrice: number
  mtmValue: number

  unrlzd: number
  timetest: string
  tax: number
}

const openViewOrders = () => {
  // Check open positions by order
  const opens: View[] = []

  const unfilledOrders = env.data.orders.filter((o) => o.quantity !== o.filled)
  for (const o of unfilledOrders) {
    const q = o.quantity - o.filled
    const m = q / o.quantity
    const mtmPrice = getPriceBySymbol(o.symbol)

    opens.push({
      since: o.datetime.toLocaleDateString(),
      symbol: o.symbol,
      quantity: q,
      partFill: o.filled !== 0,

      basisPrice: o.tprice,
      basis: o.basis * m,

      mtmPrice: mtmPrice,
      mtmValue: mtmPrice * q,

      unrlzd: mtmPrice * q - o.basis * m,
      timetest: getDateDiffDisplay(o.datetime, new Date()),
      tax: (mtmPrice * q - o.basis * m) * TAX_BRACKET,
    })
  }

  // Sort
  opens.sort((a, b) => (a.symbol as string).localeCompare(b.symbol as string))

  return opens
}

function openPositionsOrderView() {
  const results: GeneratedView<View> = {
    title: "Open orders",
    table: openViewOrders(),
  }

  return [results]
}

const viewDefinition: ViewDefinition<View> = {
  name: "Open Positions - Detailed",
  command: "oo",
  generateView: openPositionsOrderView,
  description: {
    table: "Open positions detailed (breakdown by order)",
    row: "one unfilled order, sorted by symbol then date",
    notes: ["values proportional to unfilled part."],
  },
  screenplay: {},
}

export default viewDefinition
