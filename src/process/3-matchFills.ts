import { CODES, TAX_BRACKET } from "../config/config"
import { Fill } from "../types/fills"
import { Order } from "../types/orders"
import { assert, codeAddFlag, did3yPass, getDateDiff } from "../utils"

/**
 * Helper function. Creates a Fill object from [open order, close order, quantity].
 */
const spawnFill = (open: Order, close: Order, quantity: number, id: number): Fill => {
    const openq = open.quantity
    const closeq = close.quantity

    const basis = (open.basis * quantity) / openq
    const proceeds = (close.proceeds * quantity) / closeq
    const commfee = (close.commfee * quantity) / closeq

    const realizedpl = proceeds + commfee + basis

    const timetestApplied = did3yPass(open.datetime, close.datetime)

    return {
        openId: open.id,
        closeId: close.id,
        symbol: open.symbol,

        quantity,
        basis,
        proceeds,
        commfee,
        realizedpl,

        timetest: getDateDiff(open.datetime, close.datetime),
        tax: timetestApplied ? 0.00001 : realizedpl * TAX_BRACKET,
        timetestApplied,

        thisId: id,
    }
}

/**
 * Validates spawned fills for one closing order by comparing IB and computed values.
 */
const validateFillsPerCloseOrder = (fills: Fill[], currentClose: Order) => {
    const totalBasis = fills.map((f) => f.basis).reduce((a, b) => a + b) // Sum of all fillBasis's
    assert(totalBasis - currentClose.basis <= 5, `Basis computed and given by IB differing for ${currentClose.id}!`)

    const totalCloseCommfee = fills.map((f) => f.commfee).reduce((a, b) => a + b) // Sum of all fillCommfee's
    assert(
        totalCloseCommfee - currentClose.commfee <= 5,
        `Commfee computed and given by IB differing for ${currentClose.id}!`
    )

    const totalPnl = fills.map((f) => f.realizedpl).reduce((a, b) => a + b) // Sum of all fillRealizedpl's
    assert(
        totalPnl - currentClose.realizedpl <= 5,
        `Realized PL computed and given by IB differing for ${currentClose.id}!`
    )
}

/**
 * Matches `currentClose` order against all potential `matchableOpens`.
 * @notice Does not support O;C orders.
 */
const matchFillsPerCloseOrder = (matchableOpens: Order[], currentClose: Order): Fill[] => {
    const fills = []

    let unfilled = currentClose.quantity // careful, signed!

    // Match orders and spawn fills
    for (const open of matchableOpens) {
        const availableToFill = open.quantity - open.filled

        const fill = // becomes a signed version of Math.min(availableToFill, unfilled)
            Math.abs(availableToFill) <= Math.abs(unfilled)
                ? -1 * availableToFill // some available: partially fills `currentClose`, fully fills `open`
                : unfilled // all available: fully fills `currentClose`, partially fills `open`

        // Update fill counters
        open.filled -= fill
        currentClose.filled += fill
        unfilled -= fill

        // Spawn a fill
        fills.push(spawnFill(open, currentClose, fill, fills.length))

        if (unfilled === 0) break
    }

    // Unimplemented scenario: close and open together (e.g. 10 AAPL, sell 20 AAPL -> 10 fill + 10 short-sell new order)
    assert(
        unfilled === 0,
        "Unimplemented situation: filled some, cannot match fully. Possibly a missing or mismatched trade."
    )

    // CurrentClose mutations
    currentClose.action = currentClose.quantity > 0 ? "Close (rebuy short)" : "Close (sell)"
    currentClose.tax = fills.map((f) => f.tax).reduce((a, b) => a + b)

    if (fills.filter((f) => f.timetestApplied).length > 0)
        currentClose.code = codeAddFlag(currentClose.code, CODES.CUSTOM.TIMETEST_PASSED)

    // Validate against IB
    validateFillsPerCloseOrder(fills, currentClose)

    return fills
}

/**
 * Transform Order[] of a single symbol into Fill[] by iterating over them and matching them
 * against previous orders for the same symbol, not fully filled (closed) orders.
 */
const matchFillsPerSymbol = (orders: Order[]) => {
    let fills: Fill[] = []

    for (const current of orders) {
        // Filter only previous orders with different direction
        const matchableOpens = orders.filter(
            (matchCandidate) =>
                Math.abs(matchCandidate.quantity) > Math.abs(matchCandidate.filled) && // is not already fully filled
                matchCandidate.datetime < current.datetime && // is previous order
                current.quantity * matchCandidate.quantity < 0 // is opposite direction
        )

        // If `current` is opening order, only assign text action flag.
        if (matchableOpens.length === 0) {
            current.action = current.quantity > 0 ? "Open (buy)" : "Open (short)"
        } else {
            // If `current` is closing order, spawn fills and mutate the order
            fills = [...fills, ...matchFillsPerCloseOrder(matchableOpens, current)]
        }
    }

    return fills
}

/**
 * Transform Order[] into Fill[] by iterating over all orders per symbol and matching them
 * against previous orders for the same symbol, not fully filled (closed) orders.
 * Also validates math that is being executed within this transformation.
 * Mutates `action` flag and values for `filled` and `tax` for orders.
 */
const matchFills = (orders: Order[], symbols: Set<string>): Fill[] => {
    let fills: Fill[] = []

    for (const sym of symbols) {
        const orderSlice = orders.filter((o) => o.symbol === sym)
        fills = [...fills, ...matchFillsPerSymbol(orderSlice)]
    }

    return fills
}

export default matchFills
