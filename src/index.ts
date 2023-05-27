import { env } from "./env"
import { HELP_STRING } from "./config/config"
import { performFullReload } from "./process/loader"
import { applicationWizardLoop } from "./views/wizard"

const main = () => {
    env.log("Interactive Brokers Analyzer (fs-public 2023) starting up...\n")

    performFullReload(true).then(() => {
        env.log(HELP_STRING)
        applicationWizardLoop()
    })
}

main()
