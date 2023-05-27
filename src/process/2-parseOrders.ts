import { DERIVATIVES_MULTIPLIERS } from "../config/prices"
import { parseNumerical } from "../config/helpers"
import { env } from "../env"
import { Order, UnschemedOrder } from "../types/orders"
import { SchemedRecord } from "../types/records"
import { TARGET_SCHEMA } from "../config/sources"

/**
 * Helper used in `schemeOrder` to find derivative multiplier.
 */
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

/**
 * Remaps `SchemedRecord` (array without any column names) into object with keys based on IB reported `TARGET_SCHEMA`.
 * @returns `[..., 'AAPL', 15, ...]` -> `{ ..., 'Symbol': 'AAPL', 'T. Price': 150, ...}`
 */
const schemedRecordToUnschemedOrder = (record: SchemedRecord): UnschemedOrder => {
    return Object.fromEntries(
        record.map((value: any, index: number) => [TARGET_SCHEMA[index], value])
    ) as UnschemedOrder
}

/**
 * Remaps IB reported columns (`UnschemedOrder` derived from `TARGET_SCHEMA`) into our own type of `Order`.
 */
const schemeOrder = (o: UnschemedOrder, id: number): Order => {
    // delete o["trades"] // always 'Trades'
    // delete o["header"] // always 'Data'
    // delete o["datadiscriminator"] // always 'Order'
    // delete o["cprice"] // not interested in closing price of the instrument at the day of trade
    // delete o["mtmpl"] // not interested in profit/loss at the time of export

    return {
        id,
        assetcategory: o["Asset Category"] as string,
        currency: o["Currency"] as string,
        symbol: o["Symbol"] + "-" + o["Currency"],
        datetime: new Date(o["Date/Time"]),
        quantity: parseNumerical(o["Quantity"]),
        tprice: parseNumerical(o["T. Price"]) * getMultiplier(o["Asset Category"] as string, o["Symbol"] as string),
        proceeds: parseNumerical(o["Proceeds"]),
        commfee: parseNumerical(o["Comm/Fee"]),
        basis: parseNumerical(o["Basis"]),
        realizedpl: parseNumerical(o["Realized P/L"]),
        code: o["Code"] as string,

        // fields to-be-determined later in 3-matchFills.ts
        action: "",
        filled: 0,
        tax: 0,
    }
}

const parseOrders = (records: SchemedRecord[]): Order[] => {
    // Apply scheming pipeline to every record
    return records
        .map((record) => schemedRecordToUnschemedOrder(record))
        .map((unschemed, index) => schemeOrder(unschemed, index))
}

export default parseOrders
