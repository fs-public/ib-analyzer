// Every fill matches an open and a close
export type Fill = {
    // Links to the orders
    closeId: number // primary, order that spawned this
    openId: number // the order that this fill filled (open)
    symbol: string

    // Self-computed fields - fill values
    quantity: number
    basis: number
    proceeds: number
    commfee: number
    realizedpl: number

    timetest: number
    tax: number
    timetestApplied: boolean

    // Self-computed fields - descriptors
    thisId: number
}
