import { HELP_STRING, HELP_CODES } from "../config/config"
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
        await exportPdf()
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
      case "codes":
        env.log(HELP_CODES)
        break
      case "q":
      case "quit":
        quit = true
        break

      // Views and fallback
      default:
        const [com, args] = command.split(" ")
        const matchedView = Object.values(Views).findIndex((view) => view.command.split(" ")[0] === com)
        if (matchedView !== -1) {
          await playView(matchedView as ViewType, args)
          break
        } else env.log("Unrecognized command.")
    }
  }
}
