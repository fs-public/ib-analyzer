import { env } from "../env"
import { getUserENTERInput } from "../utils"
import { VIEWS, ViewType } from "./definitions"

export const playView = async (viewType: ViewType) => {
    const view = VIEWS[viewType]

    env.log("")
    env.log(`${view.name} ${">>>".repeat(40)}`)
    env.log("")
    if (view.description.table) env.log(`Table = ${view.description.table}.`)
    if (view.description.row) env.log(`Row = ${view.description.table}.`)
    view.description.notes?.forEach((note) => env.log(`Note: ${note}`))

    const instance = view.generator()

    instance.next()

    while (!instance.next().done) {
        if (!(await getUserENTERInput(view.screenplay?.nextTableMessage))) return
    }

    env.log(`\n${view.name} view completed.`)
}
