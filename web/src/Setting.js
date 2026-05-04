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

import React from "react";
import {Tooltip, message, theme} from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import Sdk from "casdoor-js-sdk";
import * as Conf from "./Conf";

export let ServerUrl = "";
export let CasdoorSdk;

export function initServerUrl() {
  const hostname = window.location.hostname;
  if (hostname === "localhost") {
    ServerUrl = "http://localhost:14001";
  }
}

// Join API-relative paths (e.g. /api/download-file?...) with ServerUrl for display or <img src>.
export function getAbsoluteUrl(relative) {
  if (!relative) {
    return "";
  }
  if (/^https?:\/\//i.test(relative)) {
    return relative;
  }
  const base = (ServerUrl || "").replace(/\/$/, "");
  const path = relative.startsWith("/") ? relative : `/${relative}`;
  return `${base}${path}`;
}

export function isImageMimeOrExt(fileType, displayName, name) {
  const ft = (fileType || "").toLowerCase();
  if (ft.startsWith("image/")) {
    return true;
  }
  const pick = (displayName || name || "").toLowerCase();
  const dot = pick.lastIndexOf(".");
  const ext = dot >= 0 ? pick.slice(dot + 1) : "";
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext);
}

function parseCookieValue(name) {
  const match = document.cookie.match(new RegExp("(^|;)\\s*" + name + "=([^;]*)"));
  return match ? match[2] : null;
}

export function initWebConfig() {
  const raw = parseCookieValue("jsonWebConfig");
  if (!raw || raw === "null") {
    return;
  }
  try {
    const decoded = decodeURIComponent(raw.replace(/\+/g, " "));
    const config = JSON.parse(decoded);
    Conf.setConfig(config);
  } catch (e) {
    // ignore malformed cookie
  }
}

export function initCasdoorSdk(config) {
  if (!config || !config.serverUrl) {
    return;
  }
  CasdoorSdk = new Sdk(config);
}

export function isCasdoorAvailable() {
  return !!(Conf.AuthConfig && Conf.AuthConfig.serverUrl);
}

export function getSigninUrl() {
  if (!CasdoorSdk || !isCasdoorAvailable()) {
    return "";
  }
  return CasdoorSdk.getSigninUrl();
}

export function signin() {
  return CasdoorSdk.signin(ServerUrl);
}

export function getMyProfileUrl(account) {
  if (!CasdoorSdk || !isCasdoorAvailable()) {
    return "#";
  }
  return CasdoorSdk.getMyProfileUrl(account, window.location.href);
}

export function openLink(url) {
  window.open(url, "_blank");
}

export function setThemeColor(color) {
  const meta = document.querySelector("meta[name='theme-color']");
  if (meta) {
    meta.setAttribute("content", color);
  }
}

export function getAlgorithm(themeAlgorithm = ["default"]) {
  const algorithms = [];
  if (themeAlgorithm.includes("dark")) {
    algorithms.push(theme.darkAlgorithm);
  }
  if (themeAlgorithm.includes("compact")) {
    algorithms.push(theme.compactAlgorithm);
  }
  return algorithms;
}

export function getHtmlTitle(htmlTitle) {
  return htmlTitle || "教育数据管理平台";
}

export function getFaviconUrl(themeAlgorithm, faviconUrl) {
  return faviconUrl || "/favicon.ico";
}

export function getLogo(themeAlgorithm = ["default"], logoUrl = "") {
  let res = logoUrl || "";
  if (Conf.StaticBaseUrl && res.includes("https://cdn.openagentai.org")) {
    res = res.replace("https://cdn.openagentai.org", Conf.StaticBaseUrl);
  }
  if (themeAlgorithm.includes("dark") && res.endsWith(".png")) {
    return res.replace(/\.png$/, "_white.png");
  }
  return res;
}

export function getFooterHtml(themeAlgorithm, footerHtml) {
  let res = footerHtml || "";
  if (Conf.StaticBaseUrl && res.includes("https://cdn.openagentai.org")) {
    res = res.replace("https://cdn.openagentai.org", Conf.StaticBaseUrl);
  }
  if (themeAlgorithm?.includes("dark")) {
    return res.replace(/(\.png)/g, "_white$1");
  }
  return res;
}

export function getAcceptLanguage() {
  return localStorage.getItem("language") || navigator.language || "zh-CN";
}

export async function handleFetchResponse(res) {
  const text = await res.text();
  if (text === "") {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return {status: "error", msg: text};
  }
}

export function getItem(label, key, icon, children, type) {
  return {key, icon, children, label, type};
}

export function isMobile() {
  return window.innerWidth <= 768;
}

export function isLocalhost() {
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

export function getLabel(text, tooltip) {
  if (!tooltip) {
    return text;
  }
  return (
    <span>
      {text}&nbsp;
      <Tooltip title={tooltip}>
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  );
}

export function getOption(label, value) {
  return {label, value};
}

export function getShortName(name) {
  if (!name) {
    return "";
  }
  return name.length <= 2 ? name : name.slice(0, 2).toUpperCase();
}

export function getAvatarColor(name) {
  const colors = ["#404040", "#2563eb", "#16a34a", "#9333ea", "#dc2626"];
  const seed = (name || "").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return colors[seed % colors.length];
}

export function isAnonymousUser(account) {
  return account === null || account?.name === "anonymous";
}

export function isLocalAdminUser(account) {
  return isAdminUser(account);
}

export function isBasicLoginMode() {
  return true;
}

export function getRequestStore() {
  return "";
}

export function isResponseDenied(data) {
  return data?.status === "error" && (data?.msg || "").includes("denied");
}

export function getProviderDisplayName(provider) {
  return provider?.displayName || provider?.name || "";
}

export function getOtherProviderInfo() {
  return {
    Storage: {
      "Local File System": {
        url: "",
        logo: "https://cdn.openagentai.org/img/provider/local_file_system.png",
      },
      "OpenAI File System": {
        url: "https://platform.openai.com/storage",
        logo: "https://cdn.openagentai.org/img/provider/openai.png",
      },
      "Casdoor": {
        url: "https://casdoor.org",
        logo: "https://cdn.openagentai.org/img/provider/casdoor.png",
      },
    },
  };
}

export function getProviderCategoryDisplayName(category) {
  const categoryMap = {
    Storage: "存储",
  };
  return categoryMap[category] || category || "";
}

export function getProviderTypeDisplayName(type) {
  const typeMap = {
    "Local File System": "本地文件系统",
    "OpenAI File System": "OpenAI 文件系统",
    Casdoor: "Casdoor",
  };
  return typeMap[type] || type || "";
}

export function getProviderStateDisplayName(state) {
  const stateMap = {
    Active: "启用",
    Inactive: "停用",
  };
  return stateMap[state] || state || "";
}

export function getProviderLogoURL(provider) {
  const info = getOtherProviderInfo()[provider?.category]?.[provider?.type];
  return info?.logo || "https://cdn.openagentai.org/img/provider/local_file_system.png";
}

export function getProviderTypeOptions(category) {
  if (category !== "Storage") {
    return [];
  }
  return [
    {id: "Local File System", name: "本地文件系统"},
    {id: "OpenAI File System", name: "OpenAI 文件系统"},
    {id: "Casdoor", name: "Casdoor"},
  ];
}

export function myParseInt(i) {
  const res = parseInt(i);
  return Number.isNaN(res) ? 0 : res;
}

export function myParseFloat(f) {
  const res = parseFloat(f);
  return Number.isNaN(res) ? 0 : res;
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
  if (!account) {return false;}
  return account.isAdmin || account.role === "admin";
}

export function getSchool(account) {
  if (!account) {return "";}
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
  if (bytes === 0) {return "0 B";}
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatDate(dateStr) {
  if (!dateStr) {return "";}
  try {
    return new Date(dateStr).toLocaleString("zh-CN");
  } catch {
    return dateStr;
  }
}

export function getFormattedDate(date) {
  if (date === undefined || date === null) {
    return null;
  }
  date = date.replace("T", " ");
  date = date.replace("+08:00", " ");
  return date;
}

export function getShortText(s, maxLength = 35) {
  if (!s) {
    return "";
  }
  if (s.length > maxLength) {
    return `${s.slice(0, maxLength)}...`;
  } else {
    return s;
  }
}

export function getFriendlyFileSize(size) {
  if (size < 1024) {
    return size + " B";
  }
  const i = Math.floor(Math.log(size) / Math.log(1024));
  let num = (size / Math.pow(1024, i));
  const round = Math.round(num);
  num = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round;
  return `${num} ${"KMGTPEZY"[i - 1]}B`;
}

export function formatJsonString(s) {
  if (s === "") {
    return "";
  }
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch (error) {
    return s;
  }
}

export function GenerateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function deleteRow(array, i) {
  return [...array.slice(0, i), ...array.slice(i + 1)];
}

export function getRequestOrganization(account) {
  if (isAdminUser(account)) {
    return account.owner;
  }
  return account.owner;
}

export function canViewAllUsers(account) {
  if (account === undefined || account === null) {
    return false;
  }
  return isAdminUser(account);
}

export function filterTableColumns(columns, formItems, actionKey = "action") {
  if (!formItems || formItems.length === 0) {
    return columns;
  }
  const visibleColumns = formItems
    .filter(item => item.visible !== false)
    .map(item => {
      const matchedColumn = columns.find(col => col.key === item.name);
      if (matchedColumn) {
        return {
          ...matchedColumn,
          width: item.width !== undefined ? `${item.width}px` : matchedColumn.width,
          title: item.width !== undefined ? item.label : matchedColumn.title,
        };
      }
      return null;
    })
    .filter(col => col !== null);

  const actionColumn = columns.find(col => col.key === actionKey);
  return [...visibleColumns, actionColumn].filter(col => col);
}
