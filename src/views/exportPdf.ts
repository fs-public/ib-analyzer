import fs from "fs"
import Handlebars from "handlebars"
import pdf from "html-pdf"
import { env } from "../env"
import { assert } from "../utils"

const exportPdf = async () => {
    const data = {
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
                border: "2in",
            })
            .toFile("output/pdf.pdf", (err: Error) => resolve(err))
    )

    assert(!err, "Error saving PDF: " + err?.message)

    env.log("Successfully exported PDF!")
}

export default exportPdf
