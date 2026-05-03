import {serverGet, serverPost} from "./FetchBackend";

export function getGrades(owner, page, pageSize, field, value, sortField, sortOrder) {
  return serverGet(`/api/get-grades?owner=${owner || ""}&p=${page}&pageSize=${pageSize}&field=${field || ""}&value=${value || ""}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""}`);
}

export function getGrade(owner, name) {
  return serverGet(`/api/get-grade?id=${owner}/${name}`);
}

export function addGrade(grade) {
  return serverPost("/api/add-grade", grade);
}

export function updateGrade(owner, name, grade) {
  return serverPost(`/api/update-grade?id=${owner}/${name}`, grade);
}

export function deleteGrade(grade) {
  return serverPost("/api/delete-grade", grade);
}
