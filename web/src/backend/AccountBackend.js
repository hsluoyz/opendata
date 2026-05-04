import {serverGet, serverPost} from "./FetchBackend";

export function getAccount() {
  return serverGet("/api/get-account");
}

export function signout() {
  return serverPost("/api/signout", {});
}
