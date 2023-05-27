import { DERIVATIVES_MULTIPLIERS } from "../config/prices"
import { parseNumerical, recordKeyReplaceRule, shouldDropRecord } from "../config/sources"
import { env } from "../env"
import { Order } from "../types/orders"
import { SchemedRecord } from "../types/records"

const getMultiplier = (assetcategory: string, symbol: string): number => {
    if (assetcategory === "Stocks") return 1

    for (const pair of DERIVATIVES_MULTIPLIERS) {
        if (symbol.includes(pair.matcher)) {
            return pair.multiplier
        }
    }

    env.error("A derivative without recognized multiplier: " + symbol)
    return 1
}

const schemeOrder = (o: any, id: number): Order => {
    // delete o["trades"] // always 'Trades'
    // delete o["header"] // always 'Data'
    // delete o["datadiscriminator"] // always 'Order'
    // delete o["cprice"] // not interested in closing price of the instrument at the day of trade
    // delete o["mtmpl"] // not interested in profit/loss at the time of export

    return {
        id,
        assetcategory: o.assetcategory,
        currency: o.currency,
        symbol: o.symbol + "-" + o.currency,
        datetime: new Date(o["datetime"]),
        quantity: parseNumerical(o.quantity),
        tprice: parseNumerical(o.tprice) * getMultiplier(o.assetcategory, o.symbol),
        proceeds: parseNumerical(o.proceeds),
        commfee: parseNumerical(o.commfee),
        basis: parseNumerical(o.basis),
        realizedpl: parseNumerical(o.realizedpl),
        code: o.code,
        // fields to-be-determined in 3-matchFills.tsx
        action: "",
        filled: 0,
        tax: 0,
    }
}

const parseOrders = (records: SchemedRecord[]): Order[] => {
    const unschemedOrders: any[] = []

    for (let i = 0; i < records.length; i++) {
        if (shouldDropRecord(records[i])) continue

        const keyedRecord = records[i].map((value: any, index: number) =>
            index === 0
                ? ["trades", "Trades"] // misbehaves in the first index, not sure why
                : [recordKeyReplaceRule(records[0][index]), value]
        )

        unschemedOrders.push(Object.fromEntries(keyedRecord))
    }

    // Apply scheming to every order
    return unschemedOrders.map((unschemed, index) => schemeOrder(unschemed, index))
}

export default parseOrders
