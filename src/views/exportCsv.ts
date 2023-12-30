import fs from "fs"
// eslint-disable-next-line import/no-unresolved
import { stringify } from "csv/sync" // see see https://github.com/import-js/eslint-plugin-import/issues/1810
import moment from "moment"
import { PATHS } from "../config/config"
import { ValueObject } from "../types/global"
import { ViewDefinition } from "../types/views"
import { Views } from "./definitions"
import { env } from "../env"

export const getRowsForView = (view: ViewDefinition) => {
  const results = view.generateView()

  const titledResults: ValueObject[] = results.flatMap((generatedView) => generatedView.table.map((row) => ({ title: generatedView.title || "", ...row })))

  return titledResults
}

const exportOneCsv = (view: ViewDefinition) => {
  const results = getRowsForView(view)

  fs.writeFileSync(PATHS.OUTPUT_DIR + moment().format("YYYYMMDD-HHmmss ") + view.name + ".csv", stringify(results, { header: true }))
}

const exportAllCsvs = () => {
  for (const key in Views) {
    exportOneCsv(Views[key as unknown as keyof typeof Views])
  }
  env.log("Successfully exported CSVs!")
}

export default exportAllCsvs
