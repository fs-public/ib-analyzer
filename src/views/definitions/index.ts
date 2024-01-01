import { ValueObject } from "../../types/global"
import { ViewDefinition } from "../../types/views"
import historicalView from "./historical"
import historicalFilteredView from "./historicalFiltered"
import lossHarvestView from "./lossHarvest"
import openPositionsDetailedView from "./openOrders"
import openPositionsView from "./openTotals"
import realizedTaxView from "./realizedTax"
import upcomingTimetestsView from "./upcomingTimetests"

export enum ViewType {
  HISTORICAL,
  HISTORICAL_FILTERED,
  LOSS_HARVEST,
  OPEN_POSITIONS,
  OPEN_POSITIONS_DETAILED,
  REALIZED_TAX,
  UPCOMING_TIMETESTS,
}

export const Views: { [key in ViewType]: ViewDefinition<ValueObject> } = {
  [ViewType.HISTORICAL]: historicalView,
  [ViewType.HISTORICAL_FILTERED]: historicalFilteredView,
  [ViewType.LOSS_HARVEST]: lossHarvestView,
  [ViewType.OPEN_POSITIONS]: openPositionsView,
  [ViewType.OPEN_POSITIONS_DETAILED]: openPositionsDetailedView,
  [ViewType.REALIZED_TAX]: realizedTaxView,
  [ViewType.UPCOMING_TIMETESTS]: upcomingTimetestsView,
}
