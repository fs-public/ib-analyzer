/**
 * Every fill matches an open order (increasing outstanding balance, positive or negative)
 * and a close (decreasing outstanding balance).
 */
export type Fill = {
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

    // Self-computed fields - descriptors
    thisId: number
}
