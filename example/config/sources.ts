import { CSVSource } from "../types/global"
import { SchemedRecord } from "../types/records"
import { assert } from "../utils"

// prettier-ignore
export const TARGET_SCHEMA = ["Trades","Header","DataDiscriminator","Asset Category","Currency","Symbol","Date/Time","Quantity","T. Price","C. Price","Proceeds","Comm/Fee","Basis","Realized P/L","MTM P/L","Code"]

export const CSV_SOURCES: CSVSource[] = [
    {
        filename: "IBCE-2020-pruned.csv",
        reschemeRequired: true,
        // prettier-ignore
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
