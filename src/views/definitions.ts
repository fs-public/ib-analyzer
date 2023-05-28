import { historicalViewGenerator } from "./h-historical"
import { lossHarvestViewGenerator } from "./l-lossHarvest"
import { realizedTaxGenerator } from "./r-realizedTax"
import { upcomingTimetestsViewGenerator } from "./u-upcomingTimetests"

export type ViewGenerator = Generator<void, void, never>

export enum ViewType {
    HISTORICAL,
    LOSS_HARVEST,
    //OPEN_ORDERS,
    REALIZED_TAX,
    UPCOMING_TIMETESTS,
}

export type ViewDefinition = {
    name: string
    command: string
    generator: () => ViewGenerator
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
            notes: ["fills (present for close orders) sum to the order just above it."],
        },
        screenplay: {
            skipFirstYield: false,
            nextTableMessage: "for next symbol",
        },
    },
    [ViewType.LOSS_HARVEST]: {
        name: "Loss Harvest",
        command: "l",
        generator: lossHarvestViewGenerator,
        description: {
            table: "one symbol",
            row: "unfilled orders, sorted by date",
            notes: ["partially filled orders are displayed proportionately to unfilled part."],
        },
        screenplay: {
            skipFirstYield: false,
            nextTableMessage: "for next symbol",
        },
    },
    [ViewType.REALIZED_TAX]: {
        name: "Realized Tax",
        command: "r",
        generator: realizedTaxGenerator,
        description: {
            table: "one year",
            row: "filled orders, sorted by date",
            notes: [],
        },
        screenplay: {
            skipFirstYield: false,
            nextTableMessage: "for next symbol",
        },
    },
    [ViewType.UPCOMING_TIMETESTS]: {
        name: "Upcoming Timetests",
        command: "u",
        generator: upcomingTimetestsViewGenerator,
        description: {
            table: "open positions (total)",
            row: "unfilled orders, sorted by date",
            notes: ["values proportional to the unfilled part."],
        },
        screenplay: {
            skipFirstYield: false,
            nextTableMessage: "for next symbol",
        },
    },
}
