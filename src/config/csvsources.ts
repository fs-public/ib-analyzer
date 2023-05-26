import { SchemedRecord, CsvSource } from "../types"
import { assert } from "../utils"

export const shouldDropRecord = (record: SchemedRecord): boolean => {
    return record[1] !== "Data" || record[3] === "Forex"
}

export const recordKeyReplaceRule = (recordKey: string): string => {
    return recordKey.replaceAll(" ", "").replaceAll("/", "").replaceAll(".", "").toLowerCase()
}

export const parseNumerical = (value: string | number): number => {
    const res =
        typeof value === "string"
            ? Number(value.replaceAll(",", "")) // remove separator of thousands
            : Number(value)
    assert(!isNaN(res), "NaN in numerical key")

    return res
}

export const DATA_BASE_DIR = "data/"

// prettier-ignore
export const TARGET_SCHEMA = ["Trades","Header","DataDiscriminator","Asset Category","Currency","Symbol","Date/Time","Quantity","T. Price","C. Price","Proceeds","Comm/Fee","Basis","Realized P/L","MTM P/L","Code"]

export const CSV_SOURCES: CsvSource[] = [
    {
        filename: "IBCE-2020-pruned.csv",
        reschemeRequired: true,
        transformation: [true,true,      true,               true,        true,     true,      true,      true,       true,      true,      true,      true,    true,       true,       "drop",      true, true],
        // prettier-ignore
        schema: ["Trades","Header","DataDiscriminator","Asset Category","Currency","Symbol","Date/Time","Quantity","T. Price","C. Price","Proceeds","Comm/Fee","Basis","Realized P/L","Realized P/L %","MTM P/L","Code"],
    },
    {
        filename: "IBCE-2021-pruned.csv",
        reschemeRequired: true,
        // prettier-ignore
        transformation: [true,true,      true,               true,        true,     "drop",    true,      true,       true,      true,      true,      true,    true,     true,     true,        true,     true],
        // prettier-ignore
        schema: ["Trades","Header","DataDiscriminator","Asset Category","Currency","Account","Symbol","Date/Time","Quantity","T. Price","C. Price","Proceeds","Comm/Fee","Basis","Realized P/L","MTM P/L","Code"],
    },
    {
        filename: "IBCE-2022-pruned.csv",
        reschemeRequired: false,
        transformation: [],
        schema: TARGET_SCHEMA,
    },
    {
        filename: "IBIE-2022-pruned.csv",
        reschemeRequired: false,
        transformation: [],
        schema: TARGET_SCHEMA,
    },
]
