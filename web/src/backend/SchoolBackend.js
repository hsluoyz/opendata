import {serverGet, serverPost} from "./FetchBackend";

export function getSchools(owner, page, pageSize, field, value, sortField, sortOrder) {
  return serverGet(`/api/get-schools?owner=${owner || ""}&p=${page}&pageSize=${pageSize}&field=${field || ""}&value=${value || ""}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""}`);
}

export function getSchool(owner, name) {
  return serverGet(`/api/get-school?id=${owner}/${name}`);
}

export function addSchool(school) {
  return serverPost("/api/add-school", school);
}

export function updateSchool(owner, name, school) {
  return serverPost(`/api/update-school?id=${owner}/${name}`, school);
}

export function deleteSchool(school) {
  return serverPost("/api/delete-school", school);
}
