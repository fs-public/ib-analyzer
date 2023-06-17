import { ViewDefinition } from "../types/views"
import historicalView from "./h-historical"
import lossHarvestView from "./l-lossHarvest"
import openPositionsView from "./o-open"
import realizedTaxView from "./r-realizedTax"
import upcomingTimetestsView from "./u-upcomingTimetests"

export enum ViewType {
    HISTORICAL,
    LOSS_HARVEST,
    OPEN_POSITIONS,
    REALIZED_TAX,
    UPCOMING_TIMETESTS,
}

export const Views: { [key in ViewType]: ViewDefinition } = {
    [ViewType.HISTORICAL]: historicalView,
    [ViewType.LOSS_HARVEST]: lossHarvestView,
    [ViewType.OPEN_POSITIONS]: openPositionsView,
    [ViewType.REALIZED_TAX]: realizedTaxView,
    [ViewType.UPCOMING_TIMETESTS]: upcomingTimetestsView,
}
