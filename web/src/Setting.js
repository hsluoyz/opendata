// Copyright 2024 The OpenData Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {message} from "antd";

export let ServerUrl = "";

export function initServerUrl() {
  const hostname = window.location.hostname;
  if (hostname === "localhost") {
    ServerUrl = `http://localhost:14001`;
  }
}

export function showMessage(type, text) {
  if (type === "success") {
    message.success(text);
  } else if (type === "error") {
    message.error(text);
  } else if (type === "warning") {
    message.warning(text);
  } else {
    message.info(text);
  }
}

export function getRandomName() {
  return Math.random().toString(36).slice(-6);
}

export function deepCopy(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj));
}

export function isAdminUser(account) {
  if (!account) return false;
  return account.isAdmin || account.role === "admin";
}

export function getSchool(account) {
  if (!account) return "";
  return localStorage.getItem("selectedSchool") || "";
}

export function setSchool(schoolName) {
  localStorage.setItem("selectedSchool", schoolName);
  window.dispatchEvent(new Event("schoolChanged"));
}

export function getGrade() {
  return localStorage.getItem("selectedGrade") || "";
}

export function setGrade(gradeName) {
  localStorage.setItem("selectedGrade", gradeName);
  window.dispatchEvent(new Event("gradeChanged"));
}

export function getClass() {
  return localStorage.getItem("selectedClass") || "";
}

export function setClass(className) {
  localStorage.setItem("selectedClass", className);
  window.dispatchEvent(new Event("classChanged"));
}

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString("zh-CN");
  } catch {
    return dateStr;
  }
}
