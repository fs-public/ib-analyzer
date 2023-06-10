import { HELP_STRING } from "../config/config"
import { env } from "../env"
import { performFullReload } from "../process/loader"
import { getUserInput } from "../utils"
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

            // Views and fallback
            default:
                let viewMatched = false
                for (const viewType in Object.keys(ViewType).filter((v) => !isNaN(Number(v)))) {
                    if (command === VIEWS[Number(viewType) as ViewType].command) {
                        viewMatched = true
                        await playView(Number(viewType) as ViewType)
                        break
                    }
                }
                if (!viewMatched) env.log("Unrecognized command.")
        }
    }
}
