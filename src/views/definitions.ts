import { ViewDefinition } from "../types/views"
import { historicalView } from "./h-historical"
import { lossHarvestView } from "./l-lossHarvest"
import { openPositionsView } from "./o-open"
import { realizedTaxView } from "./r-realizedTax"
import { upcomingTimetestsView } from "./u-upcomingTimetests"

export enum ViewType {
    HISTORICAL,
    LOSS_HARVEST,
    OPEN_POSITIONS,
    REALIZED_TAX,
    UPCOMING_TIMETESTS,
}

export const VIEWS: { [key in ViewType]: ViewDefinition } = {
    [ViewType.HISTORICAL]: {
        name: "Historical Analysis",
        command: "h",
        generator: historicalView,
        description: {
            table: "one symbol",
            row: "orders and fills (consolidated), sorted by date",
            notes: ["fills (present for close orders) sum to the order just above it."],
        },
        screenplay: {
            nextTableMessage: "for next symbol",
        },
    },
    [ViewType.LOSS_HARVEST]: {
        name: "Loss Harvest",
        command: "l",
        generator: lossHarvestView,
        description: {
            table: "one symbol",
            row: "unfilled orders, sorted by date",
            notes: ["partially filled orders are displayed proportionately to unfilled part."],
        },
        screenplay: {
            nextTableMessage: "for next symbol",
        },
    },
    [ViewType.OPEN_POSITIONS]: {
        name: "Open Positions",
        command: "o",
        generator: openPositionsView,
        description: {
            table: "Open positions (total)",
            row: "one symbol (with at least 1 unfilled order)",
            notes: ["every row sums over all unfilled or partially unfilled orders of the symbol."],
        },
        screenplay: {
            nextTableMessage: "for breakdown into open orders",
        },
    },
    [ViewType.REALIZED_TAX]: {
        name: "Realized Tax",
        command: "r",
        generator: realizedTaxView,
        description: {
            table: "one year",
            row: "filled orders, sorted by date",
            notes: [],
        },
        screenplay: {
            nextTableMessage: "for next year",
        },
    },
    [ViewType.UPCOMING_TIMETESTS]: {
        name: "Upcoming Timetests",
        command: "u",
        generator: upcomingTimetestsView,
        description: {
            table: "open positions (total)",
            row: "unfilled orders, sorted by date",
            notes: ["values proportional to the unfilled part."],
        },
        screenplay: {
            nextTableMessage: "for next symbol",
        },
    },
}
