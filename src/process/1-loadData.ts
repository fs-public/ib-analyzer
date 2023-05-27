import fs from "fs"
import { parse } from "csv-parse"
import { CSV_SOURCES } from "../config/sources"
import { assert } from "../utils"
import { env } from "../env"
import { SchemedRecord, UnschemedRecord } from "../types/records"
import { DATA_BASE_DIR } from "../config/config"
import { CSVSource } from "../types/global"
import { shouldDropRecord } from "../config/helpers"

/**
 * Loads data CSV as an array.
 */
const filenameToRecords = async (file: string) => {
    const records = []
    const parser = fs.createReadStream(file).pipe(
        parse({
            // CSV options if any
        })
    )
    for await (const record of parser) {
        // Work with each record
        records.push(record)
    }
    return records
}

/**
 * Validates source definition.
 */
const validateSourceSchema = (source: CSVSource, realHeader: UnschemedRecord) => {
    // Validate real header
    assert(
        realHeader.map((col) => col.trim()).join("") === source.schema.join(""),
        `Source schema mismatch for ${source.filename}.`
    )

    // Validate schema vs transformations
    assert(
        source.schema.length === source.transformation.length,
        `Source mismatch between schema and transformation lengths for ${source.filename}.`
    )

    // Validate final length of the schema
    assert(
        source.transformation.reduce((acc, next) => acc + (next === "drop" ? 0 : 1), 0) === 16,
        `Source schema incorrect length for ${source.filename}.`
    )
}

/**
 * Reschemes row based on source config.
 */
const reschemeRow = (row: UnschemedRecord, source: CSVSource): SchemedRecord => {
    // Assert row length
    assert(row.length === source.schema.length, `Row length does not conform to schema within ${source.filename}.`)

    const schemedRow: SchemedRecord = []
    for (let j = 0; j < source.schema.length; j++) {
        switch (source.transformation[j]) {
            case true:
                schemedRow.push(row[j])
                break
            case "drop":
                break
            case "insert-zero":
                schemedRow.push("0")
                break
        }
    }

    return schemedRow
}

/**
 * Iterates over all sources, loads them with `filenameToRecords`, performs basic validation,
 * reschemes if necessary, and drops records as per config.
 */
const loadData = async (): Promise<SchemedRecord[]> => {
    let records: SchemedRecord[] = []

    for (const source of CSV_SOURCES) {
        env.log("Importing", source.filename)

        // Load file
        const loadedRecords = await filenameToRecords(DATA_BASE_DIR + source.filename)

        // Validate schema
        validateSourceSchema(source, loadedRecords[0])

        // Save all records, reschemed if necessary
        records = [...records, ...loadedRecords.map((row) => reschemeRow(row, source))]
    }

    // Filter and return
    return records.filter((record) => !shouldDropRecord(record))
}

export default loadData
