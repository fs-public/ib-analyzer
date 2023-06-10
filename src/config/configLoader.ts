import Ajv from "ajv"
import { env } from "../env"
import { CSVSource, Transformation, ConfigMultiplier } from "../types/global"
import { assert, readJSONFromFile } from "../utils"
import { PATHS } from "./config"
//import personalData from "./personal-data.json" assert { type: "json" } // - clashes with Jest and no fallback options

export const NO_TRANSFORM: Transformation[] = [...Array(16)].fill("ok")
// prettier-ignore
export const TARGET_SCHEMA = ["Trades","Header","DataDiscriminator","Asset Category","Currency","Symbol","Date/Time","Quantity","T. Price","C. Price","Proceeds","Comm/Fee","Basis","Realized P/L","MTM P/L","Code"] as const

export const CSV_SOURCES: CSVSource[] = []
export let DERIVATIVES_MULTIPLIERS: ConfigMultiplier[] = []
export let MTM_PRICES: { [key: string]: number } = {}

interface ExpectedJsonFormat {
    sources: {
        filename: string
        transformation?: string[]
        schema?: string[]
    }[]
    derivativeMultipliers: {
        matcher: string
        multiplier: number
    }[]
    mtmPrices: { [key: string]: number }
}

export const loadAndValidateConfig = () => {
    // Load synchronously
    const personalData = (() => {
        try {
            return readJSONFromFile(PATHS.PERSONAL_CONFIG)
        } catch (e) {
            env.log(
                `Source config "${PATHS.PERSONAL_CONFIG}" not found, falling back to "${PATHS.PERSONAL_CONFIG_FALLBACK}".`
            )
            return readJSONFromFile(PATHS.PERSONAL_CONFIG_FALLBACK)
        }
    })()

    const schema = readJSONFromFile(PATHS.PERSONAL_CONFIG_SCHEMA)

    // Basic schema validation
    const ajv = new Ajv()
    const validate = ajv.compile<ExpectedJsonFormat>(schema)
    assert(
        validate(personalData),
        `Personal config not conforming to AJV schema - ${JSON.stringify(validate.errors)}`,
        true
    )

    const typedPersonalData = personalData as ExpectedJsonFormat

    // Sources
    const sources = typedPersonalData.sources

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

            // Push
            CSV_SOURCES.push({
                filename: source.filename,
                transformation: source.transformation as Transformation[],
                schema: source.schema,
            })
        }
    }

    // Multipliers - parsed as 'symbol contains this'
    DERIVATIVES_MULTIPLIERS = typedPersonalData.derivativeMultipliers

    // Prices
    MTM_PRICES = typedPersonalData.mtmPrices
    for (const symbol of Object.keys(MTM_PRICES)) {
        for (const pair of DERIVATIVES_MULTIPLIERS) {
            if (symbol.includes(pair.matcher)) {
                MTM_PRICES[symbol] *= pair.multiplier
            }
        }
    }
}
