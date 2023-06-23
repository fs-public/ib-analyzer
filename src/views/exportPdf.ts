import fs from "fs"
import path from "path"
import Handlebars from "handlebars"
import pdf from "html-pdf"
import moment from "moment"
import { env } from "../env"
import { ValueObject } from "../types/global"
import { ViewDefinition } from "../types/views"
import { assert, makeObjectFixedDashed } from "../utils"
import { Views } from "./definitions"

interface TemplateTable {
    title: string
    rows: ValueObject[]
}

const getOneTable = (view: ViewDefinition) => {
    const results = view.generateView()

    const titledResults: ValueObject[] = results.flatMap((generatedView) => [
        { title: generatedView.title },
        ...generatedView.table.map((row) => makeObjectFixedDashed(row)),
    ])

    return {
        title: view.name,
        rows: titledResults,
    }
}

const getTables = () => {
    const tables: TemplateTable[] = []

    for (const key in Views) {
        const view = Views[key as unknown as keyof typeof Views]

        // Temp (massive table)
        if (view.name === "Historical Analysis") continue

        tables.push(getOneTable(view))
    }

    return tables
}

const exportPdf = async () => {
    const data = {
        date: moment().format("DD. MM. YYYY"),
        tables: getTables(),
    }

    const hbsTemplate = fs.readFileSync("./src/templates/template.hbs").toString()
    const renderedHtml = Handlebars.compile(hbsTemplate)(data)

    // Uncomment this for styling troubleshooting
    fs.writeFileSync("./src/templates/rendered.html", renderedHtml)

    const err: Error = await new Promise((resolve) =>
        pdf
            .create(renderedHtml, {
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
