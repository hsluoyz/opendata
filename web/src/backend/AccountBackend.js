import {serverGet, serverPost} from "./FetchBackend";

export function signin(username, password) {
  return serverPost("/api/signin", {username, password});
}

export function signout() {
  return serverPost("/api/signout", {});
}

export function getAccount() {
  return serverGet("/api/get-account");
}

export function getUsers(owner, page, pageSize, field, value, sortField, sortOrder) {
  return serverGet(`/api/get-users?owner=${owner}&p=${page}&pageSize=${pageSize}&field=${field}&value=${value}&sortField=${sortField}&sortOrder=${sortOrder}`);
}

export function getUser(owner, name) {
  return serverGet(`/api/get-user?id=${owner}/${name}`);
}

export function addUser(user) {
  return serverPost("/api/add-user", user);
}

export function updateUser(owner, name, user) {
  return serverPost(`/api/update-user?id=${owner}/${name}`, user);
}

export function deleteUser(user) {
  return serverPost("/api/delete-user", user);
}
