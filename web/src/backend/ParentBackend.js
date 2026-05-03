import {serverGet, serverPost} from "./FetchBackend";

export function getParents(owner, page, pageSize, field, value, sortField, sortOrder) {
  return serverGet(`/api/get-parents?owner=${owner || ""}&p=${page}&pageSize=${pageSize}&field=${field || ""}&value=${value || ""}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""}`);
}

export function getParent(owner, name) {
  return serverGet(`/api/get-parent?id=${owner}/${name}`);
}

export function addParent(parent) {
  return serverPost("/api/add-parent", parent);
}

export function updateParent(owner, name, parent) {
  return serverPost(`/api/update-parent?id=${owner}/${name}`, parent);
}

export function deleteParent(parent) {
  return serverPost("/api/delete-parent", parent);
}
