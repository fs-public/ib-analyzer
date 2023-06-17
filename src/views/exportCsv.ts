import { env } from "../env"
import { Views, ViewType } from "./definitions"

type GenericViewRow = { [key: string]: string | number | boolean }
type TitledGenericViewRow = { title?: string } & GenericViewRow

export const exportCsv = async () => {
    const viewType = ViewType.HISTORICAL

    const view = Views[viewType]

    const instance = view.generator()

    let result = instance.next()

    let results: TitledGenericViewRow[] = []

    while (!result.done) {
        // if (result.value.title) env.log(`\n[${view.name}] ${result.value.title}`)
        const title = result.value.title || ""
        if (result.value.table) {
            const u = result.value.table.map((row) => ({ title, ...row })) as TitledGenericViewRow[]
            results = [...results, ...u]
        }

        result = instance.next()
    }

    env.table(results)
}
