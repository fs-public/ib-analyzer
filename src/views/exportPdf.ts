import fs from "fs"
import path from "path"
import Handlebars from "handlebars"
import pdf from "html-pdf"
import moment from "moment"
import { env } from "../env"
import { assert } from "../utils"
import { ViewType, Views } from "./definitions"
import { getRowsForView } from "./exportCsv"

const exportPdf = async () => {
    const data = {
        date: moment().format("DD. MM. YYYY"),
        table: {
            title: "hello world",
            rows: getRowsForView(Views[ViewType.HISTORICAL]),
        },
    }

    const err: Error = await new Promise((resolve) =>
        pdf
            .create(Handlebars.compile(fs.readFileSync("./src/templates/template.hbs").toString())(data), {
                base: "file:///" + path.resolve("./src/templates/").replaceAll("\\", "/") + "/",
                localUrlAccess: true,
                format: "A4",
                orientation: "landscape",
                border: {
                    top: "0.6in",
                    right: "0.4in",
                    bottom: "0.6in",
                    left: "0.4in",
                },
            })
            .toFile("output/pdf.pdf", (err: Error) => resolve(err))
    )

    assert(!err, "Error saving PDF: " + err?.message)

    env.log("Successfully exported PDF!")
}

export default exportPdf
