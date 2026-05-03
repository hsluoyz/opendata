import {serverGet, serverPost} from "./FetchBackend";
import * as Setting from "../Setting";

export function getFiles(owner, page, pageSize, field, value, sortField, sortOrder) {
  return serverGet(`/api/get-files?owner=${owner || ""}&p=${page}&pageSize=${pageSize}&field=${field || ""}&value=${value || ""}&sortField=${sortField || ""}&sortOrder=${sortOrder || ""}`);
}

export function getFile(owner, name) {
  return serverGet(`/api/get-file?id=${owner}/${name}`); // maps to GetFileMeta on backend
}

export function addFile(file) {
  return serverPost("/api/add-file", file);
}

export function updateFile(owner, name, file) {
  return serverPost(`/api/update-file?id=${owner}/${name}`, file);
}

export function deleteFile(file) {
  return serverPost("/api/delete-file", file);
}

export function uploadFile(formData, params) {
  const queryStr = Object.entries(params)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return fetch(`${Setting.ServerUrl}/api/upload-file?${queryStr}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  }).then(res => res.json());
}
