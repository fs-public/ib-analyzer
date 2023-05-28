import { SchemedRecord } from "../types/records"
import { assert, codeContainsFlag } from "../utils"
import { CODES } from "./config"

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
    //if (record[5] === "IEP" && record[6] === "2021-09-30, 09:30:02") return true

    // Drop irrelevant record types
    if (["Header", "SubTotal", "Total"].includes(record[1] as string)) return true

    // Drop forex
    if (record[3] === "Forex") return true

    // Drop by code
    if (
        Object.values(CODES.TO_DROP_ORDER)
            .map((dropFlag) => codeContainsFlag(record[15] as string, dropFlag))
            .includes(true)
    )
        return true

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
