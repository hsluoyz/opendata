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
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import {Select} from "antd";
import rawData from "./DashboardSchoolHaidianData.json";

const SCHOOLS_DATA = rawData["学校列表"];

// ── Difficulty codes ────────────────────────────────────────────────────────

const DIFFICULTY_LABELS = {
  A: "实验场地和设备不足",
  B: "耗材经费有限",
  C: "教师实验教学能力有待提升",
  D: "课时不够",
  E: "安全隐患问题",
};

const JINLAI_KEYS = ["科学家进校园", "少年科学院", "流动科技馆", "流动青少年宫", "科普大篷车", "科技节", "科学调查体验"];
const ZHUQU_KEYS = ["走进科技馆", "走进高新技术企业", "走进高校科研院所实验室"];
const GRADE_ORDER = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "七年级", "八年级", "九年级"];
const TEACH_TYPES = ["学生必做实验", "教师演示实验", "跨学科实践活动", "人工智能虚拟现实新技术实验"];
const TEACH_TYPES_SHORT = ["学生必做实验", "教师演示实验", "跨学科实践", "新技术实验"];

// ── Styling constants ───────────────────────────────────────────────────────

const C = {
  bg: "#030e1f",
  panelBg: "rgba(6, 28, 58, 0.85)",
  border: "rgba(0, 195, 255, 0.22)",
  borderBright: "rgba(0, 195, 255, 0.55)",
  accent: "#00c3ff",
  accentGlow: "rgba(0, 195, 255, 0.18)",
  accent2: "#00ffb8",
  accent3: "#ffd166",
  text: "#b8d8f0",
  textBright: "#e8f4ff",
};

const ANIM = `
  @keyframes sc-scan {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes sc-pulse {
    0%, 100% { box-shadow: 0 0 8px rgba(0,195,255,0.3), inset 0 0 8px rgba(0,195,255,0.05); }
    50%       { box-shadow: 0 0 20px rgba(0,195,255,0.6), inset 0 0 16px rgba(0,195,255,0.12); }
  }
  @keyframes sc-corner {
    0%,100% { opacity: 0.4; } 50% { opacity: 1; }
  }
  @keyframes sc-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sc-glow {
    0%,100% { text-shadow: 0 0 8px rgba(0,195,255,0.5); }
    50%      { text-shadow: 0 0 22px rgba(0,195,255,1), 0 0 40px rgba(0,195,255,0.4); }
  }
  @keyframes sc-grid {
    0%   { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }

  .school-select-trigger {
    border: 1px solid ${C.border};
    border-radius: 7px;
    background: rgba(0, 195, 255, 0.07);
    box-shadow: 0 0 12px rgba(0, 195, 255, 0.08);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .school-select-trigger:hover,
  .school-select-trigger.ant-select-focused {
    border-color: ${C.borderBright};
    background: rgba(0, 195, 255, 0.12);
    box-shadow: 0 0 16px ${C.accentGlow};
  }
  .school-select-trigger .ant-select-selector { padding: 0 10px !important; }
  .school-select-trigger .ant-select-arrow { color: ${C.accent2}; }

  .school-select-popup {
    padding: 6px !important;
    background: rgba(4, 20, 45, 0.98) !important;
    border: 1px solid ${C.borderBright};
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.42), 0 0 18px ${C.accentGlow};
  }
  .school-select-popup .ant-select-item {
    min-height: 32px; border-radius: 6px; color: ${C.textBright} !important;
  }
  .school-select-popup .ant-select-item-option-content {
    color: inherit !important; font-weight: 600; letter-spacing: 0.03em;
  }
  .school-select-popup .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
    background: rgba(0,195,255,0.16) !important; color: #ffffff !important;
  }
  .school-select-popup .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
    background: rgba(0,255,184,0.18) !important; color: ${C.accent2} !important;
  }
`;

// ── Helper functions ────────────────────────────────────────────────────────

function parseActivityFreq(text) {
  if (!text || text === "未开展") {return 0;}
  if (/5.*(及以上|以上)/.test(text) || /^5$/.test(text.trim())) {return 5;}
  if (/3/.test(text)) {return 3.5;}
  if (/1/.test(text)) {return 1.5;}
  const n = parseFloat(text);
  return isNaN(n) ? 0 : Math.min(n, 5);
}

function parseDifficultyCodes(str) {
  if (!str) {return [];}
  return [...new Set(str.match(/[A-E]/g) || [])];
}

function normalizeLabFreq(text) {
  if (!text || text.trim() === "") {return "—";}
  const t = text.trim();
  if (t === "5" || /3次.*(以上)?/.test(t) || /每周3/.test(t)) {return "每周3次以上";}
  if (/1.*[-—].*2/.test(t) || /-2\//.test(t)) {return "每周1-2次";}
  if (/每月/.test(t)) {return "每月1-2次";}
  if (/每学期/.test(t)) {return "每学期1-2次";}
  return t;
}

function getActiveGradesAndSubjects(school) {
  const gradeData = school["各年级周课时"];
  const activeGrades = GRADE_ORDER.filter(g => {
    const d = gradeData[g];
    return d && Object.values(d).some(v => v > 0);
  });
  const subjectSet = new Set();
  activeGrades.forEach(g => {
    const d = gradeData[g];
    if (d) {Object.entries(d).forEach(([k, v]) => {if (v > 0) {subjectSet.add(k);}});}
  });
  return {activeGrades, subjects: [...subjectSet]};
}

function getActiveTeachingSubjects(school) {
  const data = school["实验教学开展情况"];
  return Object.entries(data)
    .filter(([, v]) => Object.values(v).some(n => n > 0))
    .map(([k]) => k);
}

// ── Small reusable components ───────────────────────────────────────────────

function Corner({pos}) {
  return (
    <div style={{position: "absolute", width: 14, height: 14, animation: "sc-corner 3s ease-in-out infinite", ...pos}}>
      <div style={{position: "absolute", background: C.accent, height: 2, width: "100%", top: pos.bottom !== undefined ? undefined : 0, bottom: pos.bottom !== undefined ? 0 : undefined}} />
      <div style={{position: "absolute", background: C.accent, width: 2, height: "100%", left: pos.right !== undefined ? undefined : 0, right: pos.right !== undefined ? 0 : undefined}} />
    </div>
  );
}

function Panel({children, style, glow}) {
  return (
    <div style={{
      background: C.panelBg,
      border: `1px solid ${glow ? C.borderBright : C.border}`,
      borderRadius: 8,
      padding: "13px 15px",
      position: "relative",
      animation: "sc-pulse 4s ease-in-out infinite",
      backdropFilter: "blur(4px)",
      ...style,
    }}>
      <Corner pos={{top: -1, left: -1}} />
      <Corner pos={{top: -1, right: -1}} />
      <Corner pos={{bottom: -1, left: -1}} />
      <Corner pos={{bottom: -1, right: -1}} />
      {children}
    </div>
  );
}

function PanelTitle({children}) {
  return (
    <div style={{fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 7}}>
      <span style={{display: "inline-block", width: 3, height: 11, background: C.accent, borderRadius: 2}} />
      {children}
    </div>
  );
}

function KpiStrip({school}) {
  const t = school["专任教师配备"]["全校"];
  const items = [
    {label: "在校生总数", value: school["在校生情况"]["在校生总数"], unit: "人", color: C.accent},
    {label: "科学教师数", value: t["科学教师数"], unit: "人", color: C.accent2},
    {label: "实验室数量", value: school["实验室配备"]["实验室总数"], unit: "间", color: C.accent3},
    {label: "科技辅导员", value: school["科技辅导员"]["全校数"], unit: "人", color: "#b388ff"},
    {label: "结对机构数", value: school["校外优质科学教育资源统筹"]["结对数"], unit: "个", color: "#ff8a65"},
    {label: "科学校本课程", value: school["校本课程"]["科学相关校本课程数"], unit: "门", color: "#69c0ff"},
  ];
  return (
    <div style={{display: "flex", gap: 11, marginBottom: 14}}>
      {items.map((kpi, i) => (
        <div key={kpi.label} style={{
          flex: 1,
          background: C.panelBg,
          border: `1px solid ${kpi.color}33`,
          borderRadius: 8,
          padding: "11px 14px",
          position: "relative",
          overflow: "hidden",
          animation: "sc-in 0.5s ease both",
          animationDelay: `${i * 0.09}s`,
        }}>
          <div style={{position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${kpi.color}88, transparent)`}} />
          <div style={{fontSize: 11, color: C.text, letterSpacing: "0.05em"}}>{kpi.label}</div>
          <div style={{display: "flex", alignItems: "baseline", gap: 3, marginTop: 4}}>
            <span style={{fontSize: 24, fontWeight: 700, color: kpi.color, fontVariantNumeric: "tabular-nums", animation: "sc-glow 3s ease-in-out infinite"}}>{kpi.value}</span>
            <span style={{fontSize: 11, color: C.text}}>{kpi.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Clock({time}) {
  const pad = n => String(n).padStart(2, "0");
  return (
    <div style={{textAlign: "right"}}>
      <div style={{fontSize: 24, fontWeight: 700, color: C.accent, fontVariantNumeric: "tabular-nums", letterSpacing: "0.08em", animation: "sc-glow 2s ease-in-out infinite", lineHeight: 1}}>
        {pad(time.getHours())}<span style={{opacity: 0.5}}>:</span>{pad(time.getMinutes())}<span style={{opacity: 0.5, fontSize: 18}}>:{pad(time.getSeconds())}</span>
      </div>
      <div style={{fontSize: 11, color: C.text, marginTop: 3}}>
        {time.toLocaleDateString("zh-CN", {year: "numeric", month: "long", day: "numeric", weekday: "long"})}
      </div>
    </div>
  );
}

// ── Chart option builders ───────────────────────────────────────────────────

const SUBJECT_COLORS = {
  "科学": C.accent,
  "信息科技": C.accent2,
  "物理": "#b388ff",
  "化学": "#ff8a65",
  "生物": "#52c41a",
  "地理": C.accent3,
  "通用技术": "#69c0ff",
};

// ① 各年级科学课时 — grouped bar chart
function getGradeHoursOption(school) {
  const {activeGrades, subjects} = getActiveGradesAndSubjects(school);
  const gradeData = school["各年级周课时"];
  if (activeGrades.length === 0) {return {backgroundColor: "transparent"};}
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {type: "shadow"},
      backgroundColor: "rgba(3,20,50,0.92)",
      borderColor: C.borderBright,
      textStyle: {color: C.textBright, fontSize: 11},
      formatter: params => `${params[0].axisValue}<br/>` + params.filter(p => p.value > 0).map(p => `${p.marker}${p.seriesName}: ${p.value} 课时/周`).join("<br/>"),
    },
    legend: {
      bottom: 2,
      textStyle: {color: C.text, fontSize: 10},
      itemWidth: 10, itemHeight: 10,
    },
    grid: {top: 14, bottom: 42, left: 8, right: 10, containLabel: true},
    xAxis: {
      type: "category",
      data: activeGrades,
      axisLabel: {color: C.text, fontSize: 10},
      axisTick: {show: false},
      axisLine: {lineStyle: {color: C.border}},
    },
    yAxis: {
      type: "value",
      name: "课时/周",
      nameTextStyle: {color: "#607080", fontSize: 9},
      minInterval: 1,
      axisLabel: {color: "#607080", fontSize: 9},
      splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
    },
    series: subjects.map(subj => ({
      name: subj,
      type: "bar",
      barGap: "10%",
      barCategoryGap: "28%",
      data: activeGrades.map(g => ({
        value: gradeData[g]?.[subj] || 0,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: SUBJECT_COLORS[subj] || C.accent},
            {offset: 1, color: (SUBJECT_COLORS[subj] || C.accent) + "44"},
          ]),
          borderRadius: [3, 3, 0, 0],
        },
      })),
      label: {
        show: true, position: "top",
        color: SUBJECT_COLORS[subj] || C.accent,
        fontSize: 9,
        formatter: p => p.value > 0 ? String(p.value) : "",
      },
    })),
  };
}

// ② 实验教学开展情况 — horizontal bar chart (types on y-axis, subjects as series)
function getTeachingActivityOption(school) {
  const data = school["实验教学开展情况"];
  const activeSubjects = getActiveTeachingSubjects(school);
  const typeColors = [C.accent, C.accent2, C.accent3, "#b388ff"];

  if (activeSubjects.length === 0) {
    return {
      backgroundColor: "transparent",
      graphic: [{type: "text", left: "center", top: "middle", style: {text: "暂无实验教学数据", fill: C.text, fontSize: 13}}],
    };
  }

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {type: "shadow"},
      backgroundColor: "rgba(3,20,50,0.92)",
      borderColor: C.borderBright,
      textStyle: {color: C.textBright, fontSize: 11},
      formatter: params => {
        const idx = params[0].dataIndex;
        return `${TEACH_TYPES_SHORT[idx]}<br/>` + params.filter(p => p.value > 0).map(p => `${p.marker}${p.seriesName}: ${p.value} 次`).join("<br/>");
      },
    },
    legend: {
      right: 5, top: 0,
      textStyle: {color: C.text, fontSize: 9},
      itemWidth: 10, itemHeight: 10,
    },
    grid: {top: 24, bottom: 6, left: 8, right: 8, containLabel: true},
    yAxis: {
      type: "category",
      data: TEACH_TYPES_SHORT,
      axisLabel: {color: C.text, fontSize: 9},
      axisTick: {show: false},
      axisLine: {lineStyle: {color: C.border}},
    },
    xAxis: {
      type: "value",
      name: "次数",
      nameTextStyle: {color: "#607080", fontSize: 9},
      axisLabel: {color: "#607080", fontSize: 8},
      splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
    },
    series: activeSubjects.map((subj, si) => ({
      name: subj,
      type: "bar",
      barMaxWidth: 12,
      data: TEACH_TYPES.map((type, ti) => ({
        value: data[subj][type] || 0,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            {offset: 0, color: typeColors[si % typeColors.length]},
            {offset: 1, color: typeColors[si % typeColors.length] + "44"},
          ]),
          borderRadius: [0, 3, 3, 0],
        },
      })),
      label: {
        show: true, position: "right",
        color: C.text, fontSize: 8,
        formatter: p => p.value > 0 ? `${p.value}次` : "",
      },
    })),
  };
}

// ③ 教师配备漏斗图
function getTeacherFunnelOption(school) {
  const t = school["专任教师配备"]["全校"];
  const stages = [
    {name: "专任教师", value: t["专任教师数"], color: "#1565c0"},
    {name: "科学教师", value: t["科学教师数"], color: C.accent},
    {name: "专职科学", value: t["其中专职数"], color: C.accent2},
    {name: "理工背景", value: t["具有理工类背景数"], color: C.accent3},
    {name: "理工硕士+", value: t["理工类硕士及以上学位数"], color: "#b388ff"},
  ].filter(s => s.value >= 0);

  const maxVal = stages[0]?.value || 1;

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(3,20,50,0.92)",
      borderColor: C.borderBright,
      textStyle: {color: C.textBright, fontSize: 11},
      formatter: p => {
        const pct = maxVal > 0 ? ((p.value / maxVal) * 100).toFixed(1) : 0;
        return `${p.name}<br/>${p.value} 人 (占专任教师 ${pct}%)`;
      },
    },
    series: [{
      type: "funnel",
      left: "5%",
      top: "5%",
      bottom: "5%",
      width: "90%",
      min: 0,
      max: maxVal,
      minSize: "18%",
      maxSize: "100%",
      sort: "none",
      gap: 4,
      label: {
        show: true, position: "inside",
        color: "#fff", fontSize: 10, fontWeight: 600,
        formatter: p => `${p.name}  ${p.value}人`,
      },
      itemStyle: {opacity: 0.9},
      data: stages.map(s => ({name: s.name, value: s.value, itemStyle: {color: s.color, shadowBlur: 8, shadowColor: s.color + "66"}})),
    }],
  };
}

// ④ 科学实践活动频次 — horizontal bar with original text labels
function getActivitiesOption(school) {
  const acts = school["科学实践请进来走出去活动"];
  const allKeys = [...JINLAI_KEYS, ...ZHUQU_KEYS];
  const activeKeys = allKeys.filter(k => k in acts && acts[k] !== undefined);
  const textValues = activeKeys.map(k => acts[k] || "未开展");
  const numValues = textValues.map(parseActivityFreq);
  const isJinlai = activeKeys.map(k => JINLAI_KEYS.includes(k));

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {type: "shadow"},
      backgroundColor: "rgba(3,20,50,0.92)",
      borderColor: C.borderBright,
      textStyle: {color: C.textBright, fontSize: 11},
      formatter: params => {
        const idx = params[0].dataIndex;
        return `${activeKeys[idx]}<br/>频次：${textValues[idx]}`;
      },
    },
    legend: {
      right: 5, top: 0,
      data: ["请进来", "走出去"],
      textStyle: {color: C.text, fontSize: 10},
      itemWidth: 10, itemHeight: 10,
    },
    grid: {top: 24, bottom: 4, left: 8, right: 8, containLabel: true},
    xAxis: {
      type: "value",
      min: 0, max: 5.5,
      axisLabel: {
        color: "#607080", fontSize: 8,
        formatter: v => {
          if (v === 0) {return "未开展";}
          if (v === 1.5) {return "1-2次";}
          if (v === 3.5) {return "3-4次";}
          if (v === 5) {return "5次+";}
          return "";
        },
        interval: 0,
      },
      splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
    },
    yAxis: {
      type: "category",
      data: activeKeys,
      axisLabel: {color: C.text, fontSize: 9},
      axisTick: {show: false},
      axisLine: {lineStyle: {color: C.border}},
    },
    series: [
      {
        name: "请进来",
        type: "bar",
        barWidth: 10,
        data: numValues.map((v, i) => isJinlai[i] ? {
          value: v,
          itemStyle: {
            color: v === 0
              ? "rgba(255,255,255,0.08)"
              : new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: C.accent}, {offset: 1, color: "#00395566"}]),
            borderRadius: [0, 3, 3, 0],
          },
        } : {value: 0, itemStyle: {color: "transparent"}}),
        label: {
          show: true, position: "right",
          color: C.text, fontSize: 8,
          formatter: p => isJinlai[p.dataIndex] ? textValues[p.dataIndex] : "",
        },
      },
      {
        name: "走出去",
        type: "bar",
        barWidth: 10,
        data: numValues.map((v, i) => !isJinlai[i] ? {
          value: v,
          itemStyle: {
            color: v === 0
              ? "rgba(255,255,255,0.08)"
              : new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: C.accent2}, {offset: 1, color: "#00332266"}]),
            borderRadius: [0, 3, 3, 0],
          },
        } : {value: 0, itemStyle: {color: "transparent"}}),
        label: {
          show: true, position: "right",
          color: C.text, fontSize: 8,
          formatter: p => !isJinlai[p.dataIndex] ? textValues[p.dataIndex] : "",
        },
      },
    ],
  };
}

// ⑤ 校本课程结构 — donut chart
function getCampusCoursesOption(school) {
  const courses = school["校本课程"];
  const total = courses["科学相关校本课程数"] || 0;
  const practice = courses["其中科学动手实践类课程数"] || 0;
  const other = Math.max(0, total - practice);

  const pieData = [];
  if (practice > 0) {pieData.push({name: "动手实践类", value: practice, itemStyle: {color: C.accent2, shadowBlur: 12, shadowColor: C.accent2 + "88"}});}
  if (other > 0) {pieData.push({name: "其他类型", value: other, itemStyle: {color: "rgba(0,195,255,0.35)", shadowBlur: 6, shadowColor: C.accent + "44"}});}
  if (pieData.length === 0) {pieData.push({name: "暂无", value: 1, itemStyle: {color: "rgba(255,255,255,0.05)"}});}

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(3,20,50,0.92)",
      borderColor: C.borderBright,
      textStyle: {color: C.textBright, fontSize: 11},
      formatter: p => `${p.name}: ${p.value} 门 (${p.percent}%)`,
    },
    graphic: [{
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: `${total}\n门`,
        fill: C.textBright,
        font: "bold 20px \"PingFang SC\", sans-serif",
        textAlign: "center",
        lineHeight: 26,
      },
    }],
    legend: {
      bottom: 4,
      textStyle: {color: C.text, fontSize: 10},
      itemWidth: 10, itemHeight: 10,
    },
    series: [{
      type: "pie",
      radius: ["42%", "66%"],
      center: ["50%", "47%"],
      data: pieData,
      label: {
        show: true, color: C.text, fontSize: 10,
        formatter: p => `${p.name}\n${p.value}门`,
      },
      labelLine: {lineStyle: {color: C.border}},
      emphasis: {
        itemStyle: {shadowBlur: 18},
        label: {fontSize: 12, fontWeight: "bold"},
      },
    }],
  };
}

// ── Info panel (no chart) ───────────────────────────────────────────────────

function Badge({text, ok, neutral}) {
  const color = neutral ? C.accent3 : ok ? C.accent2 : "#ff4d4f";
  return (
    <span style={{
      display: "inline-block",
      background: color + "22",
      border: `1px solid ${color}55`,
      color,
      borderRadius: 4,
      padding: "1px 7px",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.03em",
      whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

function InfoRow({label, children}) {
  return (
    <div style={{display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.border}`}}>
      <span style={{fontSize: 10, color: "#607080", minWidth: 72, flexShrink: 0, paddingTop: 2, letterSpacing: "0.04em"}}>{label}</span>
      <span style={{fontSize: 11, color: C.text, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center"}}>{children}</span>
    </div>
  );
}

function SchoolInfoPanel({school}) {
  const vp = school["科学副校长配备"];
  const vpOk = vp?.["配置情况"]?.includes("已配置");
  const vpSrc = vp?.["来源"];
  const afterSchool = school["是否将科学教育作为课后服务必备选项"] === "是";
  const labFreqFull = normalizeLabFreq(school["实验室使用频率"]["全校"]);
  const updateStat = school["实验器材近三年更新情况"];
  const procurement = school["低值易耗品采购金额"];
  const instrument = school["实验仪器达标情况"];
  const partnerships = school["校外优质科学教育资源统筹"];
  const difficultyCodes = parseDifficultyCodes(school["实验教学主要困难"]);
  const labArea = school["实验室配备"]["总面积"];
  const students = school["在校生情况"]["在校生总数"];
  const areaPerStudent = students > 0 ? (labArea / students).toFixed(2) : "—";

  return (
    <div style={{padding: "2px 0", overflowY: "auto", maxHeight: "100%"}}>
      <InfoRow label="科学副校长">
        <Badge text={vpOk ? "已配置" : "未配置"} ok={vpOk} />
        {vpSrc && <span style={{fontSize: 10, color: "#607080"}}>{vpSrc}</span>}
      </InfoRow>
      <InfoRow label="课后服务">
        <Badge text={afterSchool ? "科学教育必备选项 ✓" : "非必备选项"} ok={afterSchool} />
      </InfoRow>
      <InfoRow label="实验室使用">
        <span style={{color: C.accent, fontWeight: 600, fontSize: 11}}>{labFreqFull}</span>
      </InfoRow>
      <InfoRow label="实验器材">
        <Badge text={updateStat || "—"} ok={updateStat === "定期更新"} neutral={updateStat === "不定期更新"} />
      </InfoRow>
      <InfoRow label="耗材采购">
        <Badge text={procurement || "—"} neutral />
      </InfoRow>
      <InfoRow label="仪器达标">
        <Badge text={`小学 ${instrument["小学数学科学实验仪器是否达标"] === "是" ? "✓" : "✗"}`} ok={instrument["小学数学科学实验仪器是否达标"] === "是"} />
        <Badge text={`初中 ${instrument["初中理科实验仪器是否达标"] === "是" ? "✓" : "✗"}`} ok={instrument["初中理科实验仪器是否达标"] === "是"} />
        <Badge text={`高中 ${instrument["普通高中理科实验仪器是否达标"] === "是" ? "✓" : "✗"}`} ok={instrument["普通高中理科实验仪器是否达标"] === "是"} />
      </InfoRow>
      <InfoRow label="结对资源">
        <span style={{color: C.accent, fontWeight: 600}}>{partnerships["结对数"]} 个</span>
        <span style={{color: "#607080", fontSize: 10}}>其中免费 {partnerships["其中免费提供数"]} 个</span>
      </InfoRow>
      <InfoRow label="生均实验面积">
        <span style={{color: C.accent2, fontWeight: 600}}>{areaPerStudent} ㎡/生</span>
        <span style={{color: "#607080", fontSize: 10}}>（总面积 {labArea} ㎡）</span>
      </InfoRow>
      <InfoRow label="主要困难">
        {difficultyCodes.length > 0
          ? difficultyCodes.map(code => (
            <span key={code} style={{display: "flex", alignItems: "center", gap: 3, width: "100%"}}>
              <Badge text={code} neutral />
              <span style={{fontSize: 10, color: "#607080"}}>{DIFFICULTY_LABELS[code]}</span>
            </span>
          ))
          : <span style={{color: "#607080", fontSize: 10}}>暂无填报</span>
        }
      </InfoRow>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

class DashboardSchoolPage extends React.Component {
  constructor(props) {
    super(props);
    const accountSchool = SCHOOLS_DATA.find(s => s["学校名称"] === props.account?.displayName) || null;
    this.state = {
      selectedSchool: accountSchool || SCHOOLS_DATA[0],
      time: new Date(),
      isFullscreen: false,
    };
    this.containerRef = React.createRef();
  }

  onFullscreenChange = () => {
    this.setState({isFullscreen: !!document.fullscreenElement});
  };

  toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      this.containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  componentDidMount() {
    this.clockTimer = setInterval(() => this.setState({time: new Date()}), 1000);
    document.addEventListener("fullscreenchange", this.onFullscreenChange);
  }

  componentWillUnmount() {
    clearInterval(this.clockTimer);
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
  }

  onSchoolChange = name => {
    const selected = SCHOOLS_DATA.find(s => s["学校名称"] === name);
    if (selected) {this.setState({selectedSchool: selected});}
  };

  render() {
    const {selectedSchool, time, isFullscreen} = this.state;
    const isSchoolAccount = SCHOOLS_DATA.some(s => s["学校名称"] === this.props.account?.displayName);
    const schoolName = selectedSchool["学校名称"];
    const schoolType = selectedSchool["基本情况"]["办学类型"];
    const CHART_H = 240;

    return (
      <div ref={this.containerRef} style={{
        background: C.bg,
        minHeight: isFullscreen ? "100vh" : "calc(100vh - 100px)",
        padding: "18px 20px 20px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
      }}>
        <style>{ANIM}</style>

        {/* grid bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "linear-gradient(rgba(0,195,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,195,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "sc-grid 12s linear infinite",
        }} />

        {/* scan line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 100,
          background: "linear-gradient(180deg, transparent, rgba(0,195,255,0.06), transparent)",
          pointerEvents: "none", zIndex: 1,
          animation: "sc-scan 6s linear infinite",
        }} />

        <div style={{position: "relative", zIndex: 2}}>

          {/* ── Header ── */}
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14}}>
            <div style={{display: "flex", alignItems: "center", gap: 16}}>
              <div>
                <div style={{fontSize: 20, fontWeight: 800, color: C.textBright, letterSpacing: "0.06em", lineHeight: 1}}>
                  海淀区 · 校级科学教育数据大屏
                </div>
                <div style={{fontSize: 11, color: C.text, marginTop: 4, letterSpacing: "0.08em"}}>
                  2025年中小学科学教育工作诊断 — 北京市海淀区学校数据
                </div>
              </div>
              <Select
                className="school-select-trigger"
                popupClassName="school-select-popup"
                classNames={{popup: {root: "school-select-popup"}}}
                value={schoolName}
                onChange={this.onSchoolChange}
                disabled={isSchoolAccount}
                style={{width: 230}}
                popupMatchSelectWidth={false}
                variant="borderless"
                options={SCHOOLS_DATA.map(s => ({value: s["学校名称"], label: s["学校名称"]}))}
                dropdownStyle={{background: "#061c3a", border: `1px solid ${C.border}`}}
                labelRender={() => (
                  <span style={{
                    background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: "0.03em",
                  }}>{schoolName}{isSchoolAccount ? "" : " ▾"}</span>
                )}
              />
            </div>

            <div style={{display: "flex", alignItems: "center", gap: 16}}>
              <div style={{textAlign: "center"}}>
                <div style={{fontSize: 11, color: C.text, letterSpacing: "0.06em"}}>学校类型</div>
                <div style={{fontSize: 12, color: C.accent2, fontWeight: 600, marginTop: 2}}>{schoolType}</div>
              </div>
              <div style={{width: 1, height: 34, background: C.border}} />
              <div style={{textAlign: "center"}}>
                <div style={{fontSize: 11, color: C.text, letterSpacing: "0.06em"}}>报告期</div>
                <div style={{fontSize: 12, color: C.accent2, fontWeight: 600, marginTop: 2}}>2025年度</div>
              </div>
              <div style={{width: 1, height: 34, background: C.border}} />
              <Clock time={time} />
              <div style={{width: 1, height: 34, background: C.border}} />
              <button
                onClick={this.toggleFullscreen}
                title={isFullscreen ? "退出全屏" : "全屏展示"}
                style={{
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.accent,
                  cursor: "pointer",
                  padding: "5px 10px",
                  fontSize: 13,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  lineHeight: 1.4,
                }}
                onMouseEnter={e => {e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `0 0 10px ${C.accentGlow}`;}}
                onMouseLeave={e => {e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none";}}
              >
                {isFullscreen ? "⊠ 退出全屏" : "⛶ 全屏"}
              </button>
            </div>
          </div>

          {/* ── KPI strip ── */}
          <KpiStrip school={selectedSchool} />

          {/* ── Row 1: 课时 | 实验教学 | 教师漏斗 ── */}
          <div style={{display: "flex", gap: 13, marginBottom: 13, alignItems: "flex-start"}}>
            <Panel style={{flex: 1.2}}>
              <PanelTitle>各年级科学课时（课时/周）</PanelTitle>
              <ReactECharts
                option={getGradeHoursOption(selectedSchool)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>

            <Panel style={{flex: 1.3}} glow>
              <PanelTitle>实验教学开展情况（次）</PanelTitle>
              <ReactECharts
                option={getTeachingActivityOption(selectedSchool)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>

            <Panel style={{flex: 1}}>
              <PanelTitle>教师队伍配备结构</PanelTitle>
              <ReactECharts
                option={getTeacherFunnelOption(selectedSchool)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>
          </div>

          {/* ── Row 2: 活动 | 校本课程 | 综合信息 ── */}
          <div style={{display: "flex", gap: 13, alignItems: "flex-start"}}>
            <Panel style={{flex: 1.6}}>
              <PanelTitle>科学实践活动参与情况（请进来 · 走出去）</PanelTitle>
              <ReactECharts
                option={getActivitiesOption(selectedSchool)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>

            <Panel style={{flex: 0.9}}>
              <PanelTitle>科学校本课程结构</PanelTitle>
              <ReactECharts
                option={getCampusCoursesOption(selectedSchool)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>

            <Panel style={{flex: 1.2}}>
              <PanelTitle>学校综合情况一览</PanelTitle>
              <div style={{height: CHART_H, overflowY: "auto"}}>
                <SchoolInfoPanel school={selectedSchool} />
              </div>
            </Panel>
          </div>

        </div>
      </div>
    );
  }
}

export default DashboardSchoolPage;
