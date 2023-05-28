import { CSVSource, Transformation } from "../types/global"
import { ConfigMultiplier } from "../types/global"
import { assert } from "../utils"
import personalData from "./personal-data.json" assert { type: "json" }

export const NO_TRANSFORM: Transformation[] = [...Array(16)].fill("ok")
// prettier-ignore
export const TARGET_SCHEMA = ["Trades","Header","DataDiscriminator","Asset Category","Currency","Symbol","Date/Time","Quantity","T. Price","C. Price","Proceeds","Comm/Fee","Basis","Realized P/L","MTM P/L","Code"] as const

export const CSV_SOURCES: CSVSource[] = []
export let DERIVATIVES_MULTIPLIERS: ConfigMultiplier[] = []
export let MTM_PRICES: { [key: string]: number } = {}

export const loadAndValidateConfig = () => {
    // Sources
    const sources = personalData.sources

    for (const source of sources) {
        if (!source.schema || !source.transformation) {
            CSV_SOURCES.push({
                filename: source.filename,
                transformation: NO_TRANSFORM,
                schema: TARGET_SCHEMA,
            })
        } else {
            // Validate schema vs transformation length
            assert(
                source.schema.length === source.transformation.length,
                `Source mismatch between schema and transformation lengths for ${source.filename}.`,
                true
            )

            // Validate final length based on the transformations
            assert(
                source.transformation.reduce((acc, next) => acc + (next === "drop" ? 0 : 1), 0) === 16,
                `Source schema incorrect length for ${source.filename}.`,
                true
            )

            // Validate only allowed keys for transformation
            source.transformation.forEach((transf) =>
                assert(
                    ["ok", "drop", "insert-zero"].includes(transf),
                    `Source unrecognized transformation "${transf}" for ${source.filename}`,
                    true
                )
            )

            // Push
            CSV_SOURCES.push({
                filename: source.filename,
                transformation: source.transformation as Transformation[],
                schema: source.schema,
            })
        }
    }

    // Multipliers - parsed as 'symbol contains this'
    DERIVATIVES_MULTIPLIERS = personalData.derivativeMultipliers

    // Prices
    MTM_PRICES = personalData.mtmPrices
    for (const symbol of Object.keys(MTM_PRICES)) {
        for (const pair of DERIVATIVES_MULTIPLIERS) {
            if (symbol.includes(pair.matcher)) {
                MTM_PRICES[symbol] *= pair.multiplier
            }
        }
    }

    console.log(CSV_SOURCES)
}
