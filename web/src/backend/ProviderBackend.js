import {serverGet, serverPost} from "./FetchBackend";

export function getProviders(owner, page, pageSize, field, value, sortField, sortOrder) {
  return serverGet(`/api/get-providers?owner=${owner || ""}&p=${page}&pageSize=${pageSize}&field=${field || ""}&value=${value || ""}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""}`);
}

export function getProvider(owner, name) {
  return serverGet(`/api/get-provider?id=${owner}/${name}`);
}

export function addProvider(provider) {
  return serverPost("/api/add-provider", provider);
}

export function updateProvider(owner, name, provider) {
  return serverPost(`/api/update-provider?id=${owner}/${name}`, provider);
}

export function deleteProvider(provider) {
  return serverPost("/api/delete-provider", provider);
}
