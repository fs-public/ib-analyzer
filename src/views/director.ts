import { env } from "../env"
import { getUserENTERInput, makeObjectFixedDashed } from "../utils"
import { Views, ViewType } from "./definitions"

export const playView = async (viewType: ViewType, args?: string) => {
  const view = Views[viewType]

  env.log("")
  env.log(`${view.name} ${">>>".repeat(40)}`)
  env.log("")
  if (view.description.table) env.log(`Table = ${view.description.table}.`)
  if (view.description.row) env.log(`Row = ${view.description.table}.`)
  view.description.notes?.forEach((note) => env.log(`Note: ${note}`))

  const results = view.generateView(args)

  for (let i = 0; i < results.length; i++) {
    const generatedView = results[i]

    env.log(`\n[${view.name}] ${generatedView.title}`)
    if (generatedView.additionalContentBefore) env.log(generatedView.additionalContentBefore)
    env.table(generatedView.table.map((row) => makeObjectFixedDashed(row)))
    if (generatedView.additionalContentAfter) env.log(generatedView.additionalContentAfter)

    if (i === results.length - 1 || !(await getUserENTERInput(view.screenplay?.nextTableMessage))) return
  }

  env.log(`\n${view.name} view completed.`)
}
