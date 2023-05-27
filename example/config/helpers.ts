import { SchemedRecord } from "../types/records"
import { assert } from "../utils"

/*
This file defines helper functions for managing IB sources, that may or may not change
based on global changes by IB, regional differences in exports, etc.
It also allows for custom matchers to drop orders and so on.
*/

/**
 * Defines records to be dropped and exempt from further analysis.
 */
export const shouldDropRecord = (record: SchemedRecord): boolean => {
    return record[1] !== "Data" || record[3] === "Forex"
}

/**
 * Standardizes column names by replacing special characters.
 */
export const recordKeyReplaceRule = (recordKey: string): string => {
    return recordKey.replaceAll(" ", "").replaceAll("/", "").replaceAll(".", "").toLowerCase()
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
