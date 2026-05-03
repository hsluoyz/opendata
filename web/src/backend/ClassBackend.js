import {serverGet, serverPost} from "./FetchBackend";

export function getClasses(owner, page, pageSize, field, value, sortField, sortOrder) {
  return serverGet(`/api/get-classes?owner=${owner || ""}&p=${page}&pageSize=${pageSize}&field=${field || ""}&value=${value || ""}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""}`);
}

export function getClass(owner, name) {
  return serverGet(`/api/get-class?id=${owner}/${name}`);
}

export function addClass(cls) {
  return serverPost("/api/add-class", cls);
}

export function updateClass(owner, name, cls) {
  return serverPost(`/api/update-class?id=${owner}/${name}`, cls);
}

export function deleteClass(cls) {
  return serverPost("/api/delete-class", cls);
}
