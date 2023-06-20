import fs from "fs"
import Handlebars from "handlebars"
import pdf from "html-pdf"
import moment from "moment"
import { env } from "../env"
import { assert } from "../utils"

const exportPdf = async () => {
    const data = {
        date: moment().format("DD. MM. YYYY"),
        table: {
            title: "hello world",
            rows: [
                { A: 15, B: 1 },
                { A: 2, B: 2 },
            ],
        },
    }

    const err: Error = await new Promise((resolve) =>
        pdf
            .create(Handlebars.compile(fs.readFileSync("./src/templates/template.hbs").toString())(data), {
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
