import { TARGET_SCHEMA } from "../config/configLoader"

// Records /////////////////////////////

/**
 * An unknown row of a source CSV file.
 */
export type UnschemedRecord = (string | number)[]

/**
 * A row of a source CSV file with expected length (16) and order of values:
 *  0      1            2                3           4       5        6        7         8      9         10      11      12       13         14     15
 * Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
 */
export type SchemedRecord = (string | number)[]

// Orders /////////////////////////////

/**
 * Trade record that has been keyed with IB default schema.
 */
export type UnschemedOrder = { [column in (typeof TARGET_SCHEMA)[number]]: string | number }

/**
 * Basic data structure. Trade record that has been parsed, validated, and keyed with our own type.
 */
export interface Order {
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

    // Computed fields during `3-matchFills` process.
    action: string
    filled: number // 0 - filled trace when analyzing sells
    tax: number
}

// Fills /////////////////////////////

/**
 * Every fill matches an open order (increasing outstanding balance, positive or negative)
 * and a close (decreasing outstanding balance). Spawned with the close.
 */
export interface Fill {
    // Links to the orders
    closeId: number // Primary identifier, links to the order that spawned this fill
    openId: number // The order that this fill filled (open). If one close fills 2+ opens, 2+ fills are spawned.
    symbol: string

    // Self-computed fields - fill values
    quantity: number
    basis: number
    proceeds: number
    commfee: number
    realizedpl: number /* xxx */
    timetest: number
    tax: number
    timetestApplied: boolean
}
