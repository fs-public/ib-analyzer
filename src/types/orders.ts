import { TARGET_SCHEMA } from "../config/sources"

export type UnschemedOrder = { [column in (typeof TARGET_SCHEMA)[number]]: string | number }

export type Order = {
    // Now data are prepared in 'orders' in SORTED format, as an array of 13-key trade objects:
    // Description of fields: https://ibkrguides.com/reportingreference/reportguide/trades_modelstatements.htm

    id: number

    // IB reported fields
    assetcategory: string // 'Stocks'
    currency: string // 'EUR'
    symbol: string // 'IMAE' - GETS CURRENCY APENDED DURING LOAD!
    datetime: Date // Date(2022-08-19T05:44:14.000Z)
    quantity: number // 90 - stocks moved
    tprice: number // 63.8 - trade price
    //     - IS MULTIPLIED BY MULTIPLIER DURING LOAD!
    proceeds: number // -5742 - my account balance change without fee as reported by IB
    //       - validated to ≈ tprice * quantity
    commfee: number // -2.871 - my account balance change fee, is always negative
    basis: number // 5744.871 - basis for position as reported by IB
    //          - validated for 'O'pening orders to ≈ proceeds + commfee
    realizedpl: number // 0 - realized profit or loss including commfee as reported by IB
    //   - validated to 0 for 'O'pening orders
    code: string // 'O' - codes, can be several with ';' delimiter
    //     - 'O'pening order, 'C'losing order

    // Self-computed fields
    action: string
    filled: number // 0 - filled trace when analyzing sells
    tax: number
}
