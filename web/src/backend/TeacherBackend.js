import {serverGet, serverPost} from "./FetchBackend";

export function getTeachers(owner, page, pageSize, field, value, sortField, sortOrder) {
  return serverGet(`/api/get-teachers?owner=${owner || ""}&p=${page}&pageSize=${pageSize}&field=${field || ""}&value=${value || ""}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""}`);
}

export function getTeacher(owner, name) {
  return serverGet(`/api/get-teacher?id=${owner}/${name}`);
}

export function addTeacher(teacher) {
  return serverPost("/api/add-teacher", teacher);
}

export function updateTeacher(owner, name, teacher) {
  return serverPost(`/api/update-teacher?id=${owner}/${name}`, teacher);
}

export function deleteTeacher(teacher) {
  return serverPost("/api/delete-teacher", teacher);
}
