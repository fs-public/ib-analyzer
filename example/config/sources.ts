import { CSVSource } from "../types/global"
import { SchemedRecord } from "../types/records"

export const NO_TRANSFORM = [...Array(16)].fill(true)
// prettier-ignore
export const TARGET_SCHEMA = ["Trades","Header","DataDiscriminator","Asset Category","Currency","Symbol","Date/Time","Quantity","T. Price","C. Price","Proceeds","Comm/Fee","Basis","Realized P/L","MTM P/L","Code"] as const

export const CSV_SOURCES: CSVSource[] = [
    {
        filename: "IBCE-2020-pruned.csv",
        // prettier-ignore
        transformation: [true,true,      true,               true,        true,     true,      true,      true,       true,      true,      true,      true,    true,       true,       "drop",      true, true],
        // prettier-ignore
        schema: ["Trades","Header","DataDiscriminator","Asset Category","Currency","Symbol","Date/Time","Quantity","T. Price","C. Price","Proceeds","Comm/Fee","Basis","Realized P/L","Realized P/L %","MTM P/L","Code"],
    },
    {
        filename: "IBCE-2021-pruned.csv",
        // prettier-ignore
        transformation: [true,true,      true,               true,        true,     "drop",    true,      true,       true,      true,      true,      true,    true,     true,     true,        true,     true],
        // prettier-ignore
        schema: ["Trades","Header","DataDiscriminator","Asset Category","Currency","Account","Symbol","Date/Time","Quantity","T. Price","C. Price","Proceeds","Comm/Fee","Basis","Realized P/L","MTM P/L","Code"],
    },
    {
        filename: "IBCE-2022-pruned.csv",
        transformation: NO_TRANSFORM,
        schema: TARGET_SCHEMA,
    },
    {
        filename: "IBIE-2022-pruned.csv",
        transformation: NO_TRANSFORM,
        schema: TARGET_SCHEMA,
    },
    {
        filename: "IBIE-2023-YTD-pruned.csv",
        transformation: NO_TRANSFORM,
        schema: TARGET_SCHEMA,
    },
]

// Use with caution.
export const shouldDropSpecificRecord = (record: SchemedRecord): boolean => {
    return record[5] === "SYMBOL_EXEMPT_FROM_ANALYSIS"
}
