import { historicalViewGenerator } from "./h-historical"

export enum ViewType {
    HISTORICAL,
    //LOSS_HARVEST
}

export type ViewDefinition = {
    name: string
    command: string
    generator: () => Generator<void, void, never>
    description: {
        table?: string
        row?: string
        notes?: string[]
    }
    screenplay?: {
        nextTableMessage?: string
        skipFirstYield?: boolean
    }
}

export const VIEWS: { [key in ViewType]: ViewDefinition } = {
    [ViewType.HISTORICAL]: {
        name: "Historical Analysis",
        command: "h",
        generator: historicalViewGenerator,
        description: {
            table: "one symbol",
            row: "orders and fills (consolidated), sorted by date",
            notes: ["Fills (present for close orders) sum to the order just above it."],
        },
        screenplay: {
            skipFirstYield: false,
            nextTableMessage: "for next symbol",
        },
    },
}
