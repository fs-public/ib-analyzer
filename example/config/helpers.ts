import { SchemedRecord } from "../types/records"
import { assert } from "../utils"

/*
This file defines helper functions for managing IB sources, that may or may not change
based on global changes by IB, regional differences in exports, etc.
It also allows for custom matchers to drop orders and so on.
*/

/**
 * Defines records to be dropped and exempt from further analysis.
 * Drops headers, subtotals, and Forex trades.
 * Drops specific orders (use with caution).
 */
export const shouldDropRecord = (record: SchemedRecord): boolean => {
    if (record[6] === "IEP" && record[7] === "2021-09-30, 09:30:02") return true

    return record[1] !== "Data" || record[3] === "Forex"
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
