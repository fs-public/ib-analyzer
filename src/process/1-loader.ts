import fs from "fs"
import { parse } from "csv-parse"
import { DATA_BASE_DIR, CSV_SOURCES } from "../config/sources"
import { assert } from "../utils"
import { SchemedRecord, UnschemedRecord } from "../types"
import { env } from "../env"

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

const reschemeRow = (row: UnschemedRecord, source: any): SchemedRecord => {
    // Validate row length
    assert(row.length === source.schema.length, "Row length does not conform to schema")

    // Dropping specific orders
    if (row[6] === "IEP" && row[7] === "2021-09-30, 09:30:02") return null // some fractional sell of IEP, probably dividend reinvesting

    if (!source.reschemeRequired) return row

    const schemedRow = []
    for (let j = 0; j < source.schema.length; j++) {
        switch (source.transformation[j]) {
            case true:
                schemedRow.push(row[j])
                break
            case "drop":
                break
            case "insertZero":
                schemedRow.push("0")
                break
            default:
                env.error("Unrecognized column " + j + " in scheme for " + source.filename)
        }
    }

    return schemedRow
}

const loader = async (): Promise<SchemedRecord[]> => {
    const records: SchemedRecord[] = []

    for (const source of CSV_SOURCES) {
        env.log("Importing", source.filename)

        const loadedRecords = await filenameToRecords(DATA_BASE_DIR + source.filename)

        // Validate column names for first row
        for (let j = 0; j < source.schema.length; j++) {
            assert(
                loadedRecords[0][j].trim() === source.schema[j],
                "Validate column " + source.schema[j] + " failed for " + source.filename
            )
        }

        for (let i = 0; i < loadedRecords.length; i++) {
            const reschemedRow = reschemeRow(loadedRecords[i], source)
            if (reschemedRow) records.push(reschemedRow)
        }
    }

    return records
}

export default loader
