import { SchemedRecord } from "../types/trades"
import { assert, codeHasOneFlag } from "../utils"
import { CODES, shouldDropSpecificRecord } from "./config"

/*
This file defines helper functions for managing IB sources, that may or may not change
based on global changes by IB, regional differences in exports, etc.
It also allows for custom matchers to drop orders and so on.
*/

/**
 * Defines records to be dropped and exempt from further analysis.
 * Drops headers, subtotals, and Forex trades. Drops codes that should be dropped.
 * Drops specific orders (use with caution).
 */
export const shouldDropRecord = (record: SchemedRecord): boolean => {
    // Specific orders drop
    if (shouldDropSpecificRecord(record)) return true

    // Drop irrelevant record types
    if (["Header", "SubTotal", "Total"].includes(record[1] as string)) return true

    // Drop forex
    if (record[3] === "Forex") return true

    // Drop by code
    if (codeHasOneFlag(record[15] as string, Object.values(CODES.TO_DROP_ORDER))) return true

    // All good otherwise
    return false
}

/**
 * Standardizes numerical values that are saved as strings.
 */
export const parseNumerical = (value: string | number): number => {
    const res =
        typeof value === "string"
            ? Number(value.replaceAll(",", "")) // remove separator of thousands
            : Number(value)

    assert(!isNaN(res), "NaN in numerical key")
    return res
}
