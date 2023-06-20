import { ValueObject } from "../types/global"
import { ViewDefinition } from "../types/views"
import historicalView from "./definitions/historical"
import lossHarvestView from "./definitions/lossHarvest"
import openPositionsView from "./definitions/open"
import realizedTaxView from "./definitions/realizedTax"
import upcomingTimetestsView from "./definitions/upcomingTimetests"

export enum ViewType {
    HISTORICAL,
    LOSS_HARVEST,
    OPEN_POSITIONS,
    REALIZED_TAX,
    UPCOMING_TIMETESTS,
}

export const Views: { [key in ViewType]: ViewDefinition<ValueObject> } = {
    [ViewType.HISTORICAL]: historicalView,
    [ViewType.LOSS_HARVEST]: lossHarvestView,
    [ViewType.OPEN_POSITIONS]: openPositionsView,
    [ViewType.REALIZED_TAX]: realizedTaxView,
    [ViewType.UPCOMING_TIMETESTS]: upcomingTimetestsView,
}
