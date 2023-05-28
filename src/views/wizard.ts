import { getUserInput } from "../utils"
import { env } from "../env"
import { HELP_STRING } from "../config/config"
import { performFullReload } from "../process/loader"
import historicalView from "./h-historical"
import realizedTax from "./r-realizedTax"
import openView from "./o-open"
import lossHarvestView from "./l-lossHarvest"
import upcomingTimetestsView from "./u-upcomingTimetests"
import { VIEWS, ViewType } from "./definitions"
import { playView } from "./director"

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

            // Views
            case "h":
                await historicalView()
                break
            case "l":
                await lossHarvestView()
                break
            case "o":
                await openView()
                break
            case "r":
                await realizedTax()
                break
            case "u":
                await upcomingTimetestsView()
                break

            // Default
            default:
                for (const viewType in Object.keys(ViewType).filter((v) => !isNaN(Number(v)))) {
                    if (command === VIEWS[Number(viewType) as ViewType].command.repeat(2))
                        await playView(Number(viewType) as ViewType)
                }
                env.log("Unrecognized command.")
        }
    }
}
