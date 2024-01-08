import fs from "fs"
import { parse } from "csv/sync"
import { PATHS } from "../config/config"
import { CSV_SOURCES } from "../config/configLoader"
import { shouldDropRecord } from "../config/helpers"
import { env } from "../env"
import { CSVSource } from "../types/global"
import { SchemedRecord, UnschemedRecord } from "../types/trades"
import { assert } from "../utils"

/**
 * Loads data CSV as an array.
 */
const filenameToRecords = async (file: string) => {
  const contents = fs.readFileSync(file).toString()

  // Filter only trades subtable
  const filteredContents = contents
    .split("\n")
    .filter((line) => line.trim().startsWith("Trades,"))
    .join("\n")

  const records: string[][] = parse(filteredContents, {
    // CSV options if any
  })

  return records
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
      case "ok":
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
    const loadedRecords = await filenameToRecords(`${PATHS.DATA_DIR}/${source.filename}`)

    // Validate real header
    assert(loadedRecords[0].map((col: string) => col.trim()).join("") === source.schema.join(""), `Source schema mismatch for ${source.filename}.`)

    // Save all records, reschemed if necessary
    records = [...records, ...loadedRecords.map((row) => reschemeRow(row, source))]
  }

  // Filter and return
  return records.filter((record) => !shouldDropRecord(record))
}

export default loadData
