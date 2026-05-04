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
import * as Conf from "./Conf";

export let ServerUrl = "";

export function initServerUrl() {
  const hostname = window.location.hostname;
  if (hostname === "localhost") {
    ServerUrl = "http://localhost:14001";
  }
}

export function initWebConfig() {}

export function initCasdoorSdk() {}

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
  return htmlTitle || Conf.HtmlTitle || "OpenData";
}

export function getFaviconUrl(themeAlgorithm, faviconUrl) {
  return faviconUrl || Conf.FaviconUrl || "/favicon.ico";
}

export function getLogo(themeAlgorithm = ["default"], logoUrl = "") {
  if (logoUrl) {
    return logoUrl;
  }
  return themeAlgorithm.includes("dark")
    ? "https://cdn.openagentai.org/img/logo-dark.png"
    : "https://cdn.openagentai.org/img/logo.png";
}

export function getFooterHtml(themeAlgorithm, footerHtml) {
  return footerHtml || Conf.FooterHtml;
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
