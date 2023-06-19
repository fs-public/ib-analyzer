import fs from "fs"
import pdf from "html-pdf"
import Handlebars from "handlebars"

const exportPdf = async () => {
    const data = { key: "world" }
    return new Promise((resolve, reject) =>
        pdf
            .create(Handlebars.compile(fs.readFileSync("./src/templates/template.html").toString())(data), {
                format: "A4",
                orientation: "landscape",
                border: "2in",
            })
            .toFile("output/pdf.pdf", (err: unknown, res: unknown) => resolve({ err, res }))
    )
}

export default exportPdf
