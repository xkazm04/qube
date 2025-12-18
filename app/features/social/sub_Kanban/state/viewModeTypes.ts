// View Mode State Types
import type { ViewMode, GroupByField } from '../swimlanes/swimlaneTypes';

export interface ViewModeState {
  viewMode: ViewMode;
  groupBy: GroupByField;
  activityPanelOpen: boolean;
}

export interface ViewModeContextValue extends ViewModeState {
  setViewMode: (mode: ViewMode) => void;
  setGroupBy: (field: GroupByField) => void;
  setActivityPanelOpen: (open: boolean) => void;
  toggleActivityPanel: () => void;
}
