import { Order, SchemedRecord } from "../types"
import { assert } from "../utils"

///////////////////////////// Records

const validateRecords = (records: SchemedRecord[]) => {
    for (let i = 0; i < records.length; i++) {
        // Checks record length
        assert(records[i].length === 16, `Bad CSV! There are not 16 fields on line ${i}`)

        // Checks recognized record TYPES
        const ALLOWED_RECORD_TYPES = ["Header", "Data", "SubTotal", "Total"]
        assert(ALLOWED_RECORD_TYPES.includes(records[i][1]), `Unrecognized record type on line ${i}`)

        if (records[i][1] === "Data") {
            // Checks DataDiscriminator for records of type Data
            assert(records[i][2] === "Order", `Unrecognized DataDiscriminator on line ${i}`)
        }

        if (records[i][1] === "Data" && records[i][3] !== "Forex") {
            for (let k of [7, 8, 10, 11]) {
                // validate numerical non-zero columns
                if ([8, 10, 11].includes(k) && records[i][3] === "Equity and Index Options") continue // Options can expire worthless (zero T. Price, proceeds, and fee)

                assert(
                    Number(records[i][k]) !== 0,
                    `Number zero in column ${k} for entry ${i} on date ${records[i][6]}`
                )
            }
        }
    }
}

/////////////////////////////  Orders

const validateOrdersMath = (orders: Order[]) => {
    for (let o of orders) {
        assert(
            Math.abs(o.quantity * o.tprice - -o.proceeds) <= 0.1,
            `Incorrect o.proceeds validation in order ${o.datetime}`
        )

        if (o.code.includes("O")) {
            assert(
                Math.abs(o.proceeds + o.commfee - -o.basis) <= 0.1,
                `Incorrect o.basis validation in Open order ${o}`
            )

            assert(Math.abs(o.realizedpl) <= 0.1, `Incorrect o.realizedpl validation in Open order ${o}`)
        }

        // Check O;C orders which are not supported
        assert(!o.code.includes("O") || !o.code.includes("C"), "Unsupported code O;C in Open order")
    }
}

const validateOrdersSort = (orders: Order[]) => {
    for (let i = 0; i < orders.length - 1; i++) {
        for (let j = i + 1; j < orders.length; j++) {
            // i < j go through all possible indices
            if (orders[i].symbol === orders[j].symbol) {
                assert(
                    orders[i].datetime < orders[j].datetime,
                    `Unsorted at order ${orders[i].datetime} in symbol ${orders[i].symbol} against ${orders[j].datetime}`
                )
            }
        }
    }
}

const validateSymbols = () => {}

///////////////////////////// Fills (or known after fills)

const validateMatches = (orders: Order[]) => {
    // Validate unmatched positions
    for (let i = 0; i < orders.length; i++) {
        for (let j = 0; j < orders.length; j++) {
            if (i !== j && orders[i].symbol === orders[j].symbol) {
                assert(
                    orders[i].quantity === orders[i].filled ||
                        orders[j].quantity === orders[j].filled ||
                        (orders[i].quantity - orders[i].filled) * (orders[j].quantity - orders[j].filled) > 0, // both + or both -
                    `Unmatched orders of ${orders[i].symbol} (probably short sell as opening position).`
                )
            }
        }
    }
}

///////////////////////////// Exports

export const validatorRecords = (records: SchemedRecord[]) => {
    validateRecords(records)
}

export const validatorOrders = (orders: Order[]) => {
    validateOrdersMath(orders)
    validateOrdersSort(orders)
    validateSymbols()
}

export const validatorFills = (orders: Order[]) => {
    validateMatches(orders)
}
