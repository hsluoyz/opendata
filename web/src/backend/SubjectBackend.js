import {serverGet, serverPost} from "./FetchBackend";

export function getSubjects(owner, page, pageSize, field, value, sortField, sortOrder) {
  return serverGet(`/api/get-subjects?owner=${owner || ""}&p=${page}&pageSize=${pageSize}&field=${field || ""}&value=${value || ""}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""}`);
}

export function getSubject(owner, name) {
  return serverGet(`/api/get-subject?id=${owner}/${name}`);
}

export function addSubject(subject) {
  return serverPost("/api/add-subject", subject);
}

export function updateSubject(owner, name, subject) {
  return serverPost(`/api/update-subject?id=${owner}/${name}`, subject);
}

export function deleteSubject(subject) {
  return serverPost("/api/delete-subject", subject);
}
