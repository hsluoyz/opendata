// Copyright 2026 The OpenAgent Authors. All Rights Reserved.
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

// Shadcn-style Ant Design theme configuration.
// Adapted from the "shadcn" preset on https://ant.design/

import {DefaultColorPrimary} from "./Conf";

function hexToRgbComma(hex) {
  const h = hex.replace(/^#/, "");
  const n = parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) {
    return "38, 38, 38";
  }
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

const primaryRgb = hexToRgbComma(DefaultColorPrimary);

// Link tokens for dark mode: light neutrals for readability on dark surfaces.
const darkLinkTokens = {
  colorLink: "#d4d4d4",
  colorLinkHover: "#f5f5f5",
  colorLinkActive: "#a3a3a3",
};

// Structural tokens that apply regardless of theme (no colors)
const structuralTokens = {
  fontFamily: "'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Segoe UI', sans-serif",
  borderRadius: 10,
  borderRadiusXS: 2,
  borderRadiusSM: 6,
  borderRadiusLG: 14,
  padding: 16,
  paddingSM: 12,
  paddingLG: 24,
  margin: 16,
  marginSM: 12,
  marginLG: 24,
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  boxShadowSecondary: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
};

// Light-mode color tokens: institutional blue with fresh greens and warm warnings.
const lightColorTokens = {
  colorPrimary: DefaultColorPrimary,
  colorSuccess: "#2e7d32",
  colorWarning: "#f57c00",
  colorError: "#c62828",
  colorInfo: DefaultColorPrimary,
  colorTextBase: "#263238",
  colorBgBase: "#ffffff",
  colorPrimaryBg: "#e3f2fd",
  colorPrimaryBgHover: "#bbdefb",
  colorPrimaryBorder: "#90caf9",
  colorPrimaryBorderHover: "#64b5f6",
  colorPrimaryHover: "#0d47a1",
  colorPrimaryActive: "#082854",
  colorPrimaryText: DefaultColorPrimary,
  colorPrimaryTextHover: "#0d47a1",
  colorPrimaryTextActive: "#082854",
  colorSuccessBg: "#e8f5e9",
  colorSuccessBgHover: "#c8e6c9",
  colorSuccessBorder: "#a5d6a7",
  colorSuccessBorderHover: "#81c784",
  colorSuccessHover: "#1b5e20",
  colorSuccessActive: "#145214",
  colorSuccessText: "#2e7d32",
  colorSuccessTextHover: "#1b5e20",
  colorSuccessTextActive: "#145214",
  colorWarningBg: "#fff3e0",
  colorWarningBgHover: "#ffe0b2",
  colorWarningBorder: "#ffcc80",
  colorWarningBorderHover: "#ffb74d",
  colorWarningHover: "#e65100",
  colorWarningActive: "#bf360c",
  colorWarningText: "#ef6c00",
  colorWarningTextHover: "#e65100",
  colorWarningTextActive: "#bf360c",
  colorErrorBg: "#ffebee",
  colorErrorBgHover: "#ffcdd2",
  colorErrorBorder: "#ef9a9a",
  colorErrorBorderHover: "#e57373",
  colorErrorHover: "#b71c1c",
  colorErrorActive: "#8b0000",
  colorErrorText: "#c62828",
  colorErrorTextHover: "#b71c1c",
  colorErrorTextActive: "#8b0000",
  colorInfoBg: "#e3f2fd",
  colorInfoBgHover: "#bbdefb",
  colorInfoBorder: "#90caf9",
  colorInfoBorderHover: "#64b5f6",
  colorInfoHover: "#0d47a1",
  colorInfoActive: "#082854",
  colorInfoText: DefaultColorPrimary,
  colorInfoTextHover: "#0d47a1",
  colorInfoTextActive: "#082854",
  colorLink: "#0d47a1",
  colorLinkHover: DefaultColorPrimary,
  colorLinkActive: "#082854",
  colorText: "#263238",
  colorTextSecondary: "#546e7a",
  colorTextTertiary: "#78909c",
  colorTextQuaternary: "#90a4ae",
  colorTextDisabled: "#b0bec5",
  colorBgContainer: "#ffffff",
  colorBgElevated: "#ffffff",
  colorBgLayout: "#eef4fc",
  colorBgSpotlight: `rgba(${primaryRgb}, 0.88)`,
  colorBgMask: "rgba(38, 50, 56, 0.45)",
  colorBorder: "#cfd8dc",
  colorBorderSecondary: "#eceff1",
};

export function getShadcnThemeToken(isDark) {
  if (isDark) {
    return {
      ...structuralTokens,
      ...darkLinkTokens,
    };
  }
  return {
    ...structuralTokens,
    ...lightColorTokens,
  };
}

// Keep for backward compatibility
export const shadcnThemeToken = {
  ...structuralTokens,
  ...lightColorTokens,
};

function getLightComponents() {
  return {
    Button: {
      primaryShadow: "none",
      defaultShadow: "none",
      dangerShadow: "none",
      defaultBorderColor: "#e4e4e7",
      defaultColor: "#18181b",
      defaultBg: "#ffffff",
      defaultHoverBg: "#f4f4f5",
      defaultHoverBorderColor: "#d4d4d8",
      defaultHoverColor: "#18181b",
      defaultActiveBg: "#e4e4e7",
      defaultActiveBorderColor: "#d4d4d8",
      borderRadius: 6,
    },
    Input: {
      activeShadow: "none",
      hoverBorderColor: "#a1a1aa",
      activeBorderColor: "#18181b",
      borderRadius: 6,
    },
    Select: {
      optionSelectedBg: "#f4f4f5",
      optionActiveBg: "#fafafa",
      optionSelectedFontWeight: 500,
      borderRadius: 6,
    },
    Alert: {
      borderRadiusLG: 8,
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Progress: {
      defaultColor: "#18181b",
      remainingColor: "#f4f4f5",
    },
    Steps: {
      iconSize: 32,
    },
    Switch: {
      trackHeight: 24,
      trackMinWidth: 44,
      innerMinMargin: 4,
      innerMaxMargin: 24,
    },
    Checkbox: {
      borderRadiusSM: 4,
    },
    Slider: {
      trackBg: "#f4f4f5",
      trackHoverBg: "#e4e4e7",
      handleSize: 18,
      handleSizeHover: 20,
      railSize: 6,
    },
    ColorPicker: {
      borderRadius: 6,
    },
    Menu: {
      itemFontSize: 14,
      groupTitleFontSize: 12,
      itemHeight: 42,
      fontWeightStrong: 600,
      itemSelectedBg: "rgba(21, 101, 192, 0.12)",
      itemSelectedColor: "inherit",
    },
    Table: {
      headerBg: "#e8eef7",
      headerSplitColor: "#cfd8dc",
      fontWeightStrong: 600,
    },
  };
}

function getDarkComponents() {
  return {
    Button: {
      primaryShadow: "none",
      defaultShadow: "none",
      dangerShadow: "none",
      borderRadius: 6,
    },
    Input: {
      activeShadow: "none",
      hoverBorderColor: "#555",
      activeBorderColor: "#888",
      borderRadius: 6,
    },
    Select: {
      optionSelectedFontWeight: 500,
      optionActiveBg: "rgba(255, 255, 255, 0.08)",
      optionSelectedBg: "rgba(255, 255, 255, 0.12)",
      hoverBorderColor: "#555",
      activeBorderColor: "#888",
      borderRadius: 6,
    },
    Alert: {
      borderRadiusLG: 8,
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Steps: {
      iconSize: 32,
    },
    Switch: {
      trackHeight: 24,
      trackMinWidth: 44,
      innerMinMargin: 4,
      innerMaxMargin: 24,
    },
    Checkbox: {
      borderRadiusSM: 4,
    },
    Slider: {
      handleSize: 18,
      handleSizeHover: 20,
      railSize: 6,
    },
    ColorPicker: {
      borderRadius: 6,
    },
    Menu: {
      itemFontSize: 14,
      groupTitleFontSize: 12,
      itemHeight: 40,
      fontWeightStrong: 600,
      itemHoverBg: "rgba(255, 255, 255, 0.08)",
      itemSelectedBg: "rgba(255, 255, 255, 0.12)",
      itemSelectedColor: "inherit",
    },
    Table: {
      fontWeightStrong: 600,
    },
  };
}

export function getShadcnThemeComponents(isDark) {
  return isDark ? getDarkComponents() : getLightComponents();
}

// Keep for backward compatibility
export const shadcnThemeComponents = getLightComponents();
