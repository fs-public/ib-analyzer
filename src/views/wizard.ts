import { getUserInput } from "../utils"
import { env } from "../env"
import { HELP_STRING } from "../config/config"
import { performFullReload } from "../process/loader"
import historicalView from "./h-historical"
import realizedTax from "./r-realizedTax"
import openView from "./o-open"
import lossHarvestView from "./l-lossHarvest"
import upcomingTimetestsView from "./u-upcomingTimetests"

export const applicationWizardLoop = async () => {
    let quit = false
    while (!quit) {
        const command = await getUserInput(">> ")

        switch (command) {
            // Admin
            case "reload":
                await performFullReload()
                break
            case "i":
            case "issues":
                env.log(env.errors)
                break
            case "example":
                env.log("\nTypical order:")
                env.log(env.data.orders[0])
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
                env.log("Unrecognized command.")
        }
    }
}
