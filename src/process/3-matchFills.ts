import { TAX_BRACKET } from "../config/config"
import { env } from "../env"
import { Fill, Order } from "../types"
import { assert, did3yPass, getDateDiff } from "../utils"

const spawnClosingFill = (open:Order, close:Order, quantity:number, id:number):Fill => {
    const openq = open.quantity
    const closeq = close.quantity

    const basis = open.basis * quantity / openq
    const proceeds = close.proceeds * quantity / closeq
    const commfee = close.commfee * quantity / closeq
    
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

// Matches fills against close order. Does not support O;C orders.
const matchFillsPerOrder = (matchableOpens: Order[], currentClose: Order):Fill[] => {
    const fills = []

    let unfilled = currentClose.quantity

    // Match fills
    for(let i = 0; i < matchableOpens.length; i++) {
        const open = matchableOpens[i]

        const availableToFill = open.quantity - open.filled

        let fill // becomes Math.min(availableToFill, unfilled)

        if(availableToFill === 0) { // none more to fill
            continue
        } else if(Math.abs(availableToFill) <= Math.abs(unfilled)) {
            // some available: partially fills current, fully fills previous
            fill = -1 * availableToFill
        } else {
            // all available: fully fills current, partially fills previous
            fill = unfilled
        }

        open.filled -= fill
        currentClose.filled += fill
        unfilled -= fill

        fills.push(spawnClosingFill(open, currentClose, fill, fills.length))

        if(unfilled === 0)
            break
    }

    if(unfilled === 0) { // Scenario A: all were filled (close order)
        // Set action
        currentClose.action = currentClose.quantity > 0 ? "Close (rebuy short)" : "Close (sell)"

        // Set total tax
        currentClose.tax = fills.map(f => f.tax).reduce((a,b)=>a+b)
        if(fills.filter(f => f.timetestApplied).length > 0)
            currentClose.code += "; tt"

        // Validate against IB
        const totalBasis = fills.map(f => f.basis).reduce((a,b)=>a+b) // Sum of all fillBasis's
        assert(totalBasis - currentClose.basis <= 5, `Basis computed and given by IB differing for ${currentClose.id}!`)

        const totalCloseCommfee = fills.map(f => f.commfee).reduce((a,b)=>a+b) // Sum of all fillCommfee's
        assert(totalCloseCommfee - currentClose.commfee <= 5, `Commfee computed and given by IB differing for ${currentClose.id}!`)
        
        const totalPnl = fills.map(f => f.realizedpl).reduce((a,b)=>a+b) // Sum of all fillRealizedpl's
        assert(totalPnl - currentClose.realizedpl <= 5, `Realized PL computed and given by IB differing for ${currentClose.id}!`)
    } else if(unfilled === currentClose.quantity) { // Scenario B: none were filled (open order)
        // Spawn open fill
        //fills.push(spawnOpeningFill(currentClose, fills.length))

        // Set action
        currentClose.action = currentClose.quantity > 0 ? "Open (buy)" : "Open (short)"
    } else { // Scenario C: close and open together
        env.error("Unimplemented situation: filled some, cannot match fully. Possibly a missing or mismatched trade.")
    }

    return fills
}

// computes fills per specific symbol
const matchFillsPerSymbol = (orders: Order[]) => {
    let fills:Fill[] = []

    for(let i = 0; i < orders.length; i++) {
        const o = orders[i]

        // Filter only earlier orders with different direction
        const matchableOpens = orders.filter(
            m => m.datetime < o.datetime && o.quantity * m.quantity < 0
        )

        // also modifies .filled and .action for o, even if does not spawn any new fills
        const newFills = matchFillsPerOrder(matchableOpens, o) 
        fills = [...fills, ...newFills]
    }

    return fills
}

const matchFills = (orders: Order[], symbols: Set<string>):Fill[] => {
    let fills:Fill[] = []

    // @ts-ignore
    for(let sym of symbols) {
        const orderSlice = orders.filter(o => o.symbol === sym)
        fills = [...fills, ...matchFillsPerSymbol(orderSlice)]
    }

    return fills
}

export default matchFills