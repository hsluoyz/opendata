import {serverGet, serverPost} from "./FetchBackend";

export function getStudents(owner, page, pageSize, field, value, sortField, sortOrder) {
  return serverGet(`/api/get-students?owner=${owner || ""}&p=${page}&pageSize=${pageSize}&field=${field || ""}&value=${value || ""}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""}`);
}

export function getStudent(owner, name) {
  return serverGet(`/api/get-student?id=${owner}/${name}`);
}

export function addStudent(student) {
  return serverPost("/api/add-student", student);
}

export function updateStudent(owner, name, student) {
  return serverPost(`/api/update-student?id=${owner}/${name}`, student);
}

export function deleteStudent(student) {
  return serverPost("/api/delete-student", student);
}
