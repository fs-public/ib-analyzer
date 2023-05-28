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

    let result = instance.next()

    while (!result.done) {
        if (result.value.title) env.log(`\n[${view.name}] ${result.value.title}`)
        if (result.value.table) env.table(result.value.table)
        if (result.value.printMoreStats) result.value.printMoreStats()

        if (!(await getUserENTERInput(view.screenplay?.nextTableMessage))) return

        result = instance.next()
    }

    env.log(`\n${view.name} view completed.`)
}
