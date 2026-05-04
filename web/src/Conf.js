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

// Institutional education blue: readable, formal, pairs well with warm accents in CSS.
export const DefaultColorPrimary = "#1565C0";

export const ThemeDefault = {
  themeType: "default",
  colorPrimary: DefaultColorPrimary,
  borderRadius: 12,
  isCompact: false,
};

export const AuthConfig = {serverUrl: "", clientId: "", appName: "", organizationName: "", redirectPath: ""};
export let StaticBaseUrl = "";
export let IsDemoMode = false;

export function setConfig(config) {
  if (!config) {
    return;
  }
  if (config.authConfig) {
    Object.assign(AuthConfig, config.authConfig);
  }
  if (config.staticBaseUrl !== undefined) {StaticBaseUrl = config.staticBaseUrl;}
  if (config.isDemoMode !== undefined) {IsDemoMode = config.isDemoMode;}
}
