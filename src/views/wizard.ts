import { HELP_STRING } from "../config/config"
import { env } from "../env"
import { performFullReload } from "../process/loader"
import { getUserInput } from "../utils"
import { Views, ViewType } from "./definitions"
import { playView } from "./director"
import exportAllCsvs from "./exportCsv"
import exportPdf from "./exportPdf"

export const applicationWizardLoop = async () => {
    let quit = false
    while (!quit) {
        const command = await getUserInput(">> ")

        switch (command) {
            // Admin
            case "":
                break
            case "reload":
                await performFullReload()
                break
            case "i":
                env.log("\n", env.errors.length > 0 ? env.errors : "No issues, you're all set to proceed!")
                break
            case "e":
                exportAllCsvs()
                break
            case "p":
                exportPdf()
                break
            case "dataformat":
                env.log("\nFirst found order:")
                env.log(env.data.orders[0])
                env.log("\nFirst found fill:")
                env.log(env.data.fills[0])
                break
            case "help":
                env.log(HELP_STRING)
                break
            case "q":
            case "quit":
                quit = true
                break

            // Views and fallback
            default:
                let viewMatched = false
                for (const viewType in Object.keys(ViewType).filter((v) => !isNaN(Number(v)))) {
                    if (command === Views[Number(viewType) as ViewType].command) {
                        viewMatched = true
                        await playView(Number(viewType) as ViewType)
                        break
                    }
                }
                if (!viewMatched) env.log("Unrecognized command.")
        }
    }
}
