import { ASSET_CATEGORIES, CODES } from "../config/config"
import { SchemedRecord, Order, Fill } from "../types/trades"
import { assert, codeHasAllFlags, codeHasFlag, getPriceBySymbol } from "../utils"

///////////////////////////// Records

const validateRecord = (record: SchemedRecord) => {
  // Helper to identify record in asserts, `symbol on date`
  const errText = (type: string) => `ValidateRecord error: ${type} for ${record[5]} on ${record[6]}`

  // Check record length
  assert(record.length === 16, errText("bad CSV - not 16 fields"))

  // Check recognized record type
  assert(record[1] === "Data", errText("unrecognized record type"))

  // Check recognized DataDiscriminator
  assert(record[2] === "Order", errText("unrecognized DataDiscriminator"))

  // Check recognized Asset Categories
  assert((Object.values(ASSET_CATEGORIES) as string[]).includes(record[3] as string), errText(`unrecognized asset category ${record[3]}`))

  // Check non-zero values of quantity, price, proceeds and fee
  for (const k of [7, 8, 10, 11]) {
    // validate numerical non-zero columns
    if ([8, 10, 11].includes(k) && record[3] === ASSET_CATEGORIES.DERIVATIVE_OPTIONS) continue // Options can expire worthless (zero T. Price, proceeds, and fee)

    assert(Number(record[k]) !== 0, errText(`unexpected zero in column ${k}`))
  }
}

/////////////////////////////  Orders

/**
 * Validate IB reported math (proceeds, basis, realizedpl) and Codes.
 */
const validateOrderMath = (o: Order) => {
  // Helper to identify order in asserts, `symbol on date`
  const errText = (type: string) => `ValidateOrder error: ${type} for ${o.symbol} on ${o.datetime}`

  assert(Math.abs(o.quantity * o.tprice - -o.proceeds) <= 0.1, errText("incorrect o.proceeds validation"))

  if (codeHasFlag(o.code, CODES.RECOGNIZED.OPEN)) {
    assert(Math.abs(o.proceeds + o.commfee - -o.basis) <= 0.1, errText("incorrect o.basis validation in Open"))
    assert(Math.abs(o.realizedpl) <= 0.1, errText("incorrect o.realizedpl validation in Open"))
  }

  // Check O;C orders which are not supported
  assert(!codeHasAllFlags(o.code, [CODES.RECOGNIZED.OPEN, CODES.RECOGNIZED.CLOSE]), errText("unsupported code O;C"))
}

/**
 * Validates that orders for every symbol follow one another without imperatively sorting them,
 * including after merging all CSVs.
 */
const validateOrdersSort = (orders: Order[]) => {
  for (let i = 0; i < orders.length - 1; i++) {
    for (let j = i + 1; j < orders.length; j++) {
      // i < j go through all possible indices
      if (orders[i].symbol === orders[j].symbol) {
        assert(
          orders[i].datetime < orders[j].datetime,
          `ValidateOrder error: unsorder in ${orders[i].symbol} from ${orders[i].datetime} to ${orders[j].datetime}`
        )
      }
    }
  }
}

///////////////////////////// Fills (or known after fills)

/**
 * Validates fills (TBD)
 */
const validateFills = (fills: Fill[]) => {
  fills
  return true
}

const validateMaximumFulfillment = (orders: Order[]) => {
  // Validate unmatched positions
  for (let i = 0; i < orders.length; i++) {
    for (let j = 0; j < orders.length; j++) {
      if (i !== j && orders[i].symbol === orders[j].symbol) {
        assert(
          orders[i].quantity === orders[i].filled ||
            orders[j].quantity === orders[j].filled ||
            (orders[i].quantity - orders[i].filled) * (orders[j].quantity - orders[j].filled) > 0, // both + or both -
          `Unmatched but matchable orders of ${orders[i].symbol} on ${orders[i].datetime} and ${orders[j].datetime} (issue in 3-matchFills logic).`
        )
      }
    }
  }

  // TODO validate that all unfilled orders have MTM_PRICES defined as well as their currencies
}

/**
 * Validates that all unfilled orders have MTM_PRICES defined as well as their currencies for open position display and valuation.
 */
const validateMTMForUnfilled = (orders: Order[]) => {
  orders.forEach((o) => {
    if (o.filled !== o.quantity) getPriceBySymbol(o.symbol)
  })
}

///////////////////////////// Exports

/**
 * Validates record length, recognization of types, and non-nullishness in columns that should not be null.
 */
export const validatorRecords = (records: SchemedRecord[]) => {
  records.forEach((record) => validateRecord(record))
}

/**
 * Validates IB reported order math (proceeds, realized P&L, ...) and their sort.
 */
export const validatorOrders = (orders: Order[]) => {
  orders.forEach((order) => validateOrderMath(order))
  validateOrdersSort(orders)
}

export const validatorFills = (fills: Fill[], orders: Order[]) => {
  validateFills(fills)
  validateMaximumFulfillment(orders)
  validateMTMForUnfilled(orders)
}
