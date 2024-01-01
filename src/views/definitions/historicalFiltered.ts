import historicalViewDefinition, { historicalViewFn } from "./historical"

const viewDefinition: typeof historicalViewDefinition = {
  name: "Historical Analysis (filter out closed positions)",
  command: "hh [search]",
  generateView: (args?: string) => historicalViewFn(args, true),
  description: historicalViewDefinition.description,
  screenplay: historicalViewDefinition.screenplay,
}

export default viewDefinition
