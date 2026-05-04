import {serverGet} from "./FetchBackend";

export function getDashboardTrend(school) {
  return serverGet(`/api/get-dashboard-trend?school=${school || ""}`);
}

export function getDashboardFileTypeDist(school) {
  return serverGet(`/api/get-dashboard-file-type-dist?school=${school || ""}`);
}

export function getDashboardSchoolDist() {
  return serverGet("/api/get-dashboard-school-dist");
}

export function getDashboardHeatmap(school) {
  return serverGet(`/api/get-dashboard-heatmap?school=${school || ""}`);
}
