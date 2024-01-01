import historicalViewDefinition, { historicalViewFn } from "./historical"

const viewDefinition: typeof historicalViewDefinition = {
  name: "Historical Analysis (filter out closed positions)",
  command: "hh",
  generateView: historicalViewFn.bind(undefined, true),
  description: historicalViewDefinition.description,
  screenplay: historicalViewDefinition.screenplay,
}

export default viewDefinition
