import {serverGet} from "./FetchBackend";

export function getStats(school) {
  return serverGet(`/api/get-stats?school=${school || ""}`);
}
