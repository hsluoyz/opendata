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
import {withRouter} from "react-router-dom";
import dashboardData from "./DashboardData.json";

const DISTRICTS_DATA = dashboardData["区县数据"];
const CITY_DATA = dashboardData["市级数据"];

function getDistrictByName(name) {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) {
    return null;
  }
  return DISTRICTS_DATA.find(d => d["名称"] === normalizedName) || null;
}

function getAccountDistrict(account) {
  return getDistrictByName(account?.displayName);
}

function getInitialDistrict(props) {
  const accountDistrict = getAccountDistrict(props.account);
  if (accountDistrict) {return accountDistrict;}
  const saved = localStorage.getItem("dashboard_district");
  return (saved && getDistrictByName(saved)) || getDistrictByName("海淀区") || DISTRICTS_DATA[0];
}

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
  @keyframes dd-scan {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes dd-pulse {
    0%, 100% { box-shadow: 0 0 8px rgba(0,195,255,0.3), inset 0 0 8px rgba(0,195,255,0.05); }
    50%       { box-shadow: 0 0 20px rgba(0,195,255,0.6), inset 0 0 16px rgba(0,195,255,0.12); }
  }
  @keyframes dd-corner {
    0%,100% { opacity: 0.4; } 50% { opacity: 1; }
  }
  @keyframes dd-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dd-glow {
    0%,100% { text-shadow: 0 0 8px rgba(0,195,255,0.5); }
    50%      { text-shadow: 0 0 22px rgba(0,195,255,1), 0 0 40px rgba(0,195,255,0.4); }
  }
  @keyframes dd-grid {
    0%   { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }

  .district-select-trigger {
    border: 1px solid ${C.border};
    border-radius: 7px;
    background: rgba(0, 195, 255, 0.07);
    box-shadow: 0 0 12px rgba(0, 195, 255, 0.08);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .district-select-trigger:hover,
  .district-select-trigger.ant-select-focused {
    border-color: ${C.borderBright};
    background: rgba(0, 195, 255, 0.12);
    box-shadow: 0 0 16px ${C.accentGlow};
  }

  .district-select-trigger .ant-select-selector {
    padding: 0 10px !important;
  }

  .district-select-trigger .ant-select-arrow {
    color: ${C.accent2};
  }

  .district-select-trigger.ant-select-disabled {
    cursor: not-allowed;
    border-color: rgba(0, 255, 184, 0.28);
    background: rgba(0, 255, 184, 0.08);
    box-shadow: 0 0 12px rgba(0, 255, 184, 0.08);
  }

  .district-select-trigger.ant-select-disabled .ant-select-selector {
    cursor: not-allowed !important;
  }

  .district-select-popup {
    padding: 6px !important;
    background: rgba(4, 20, 45, 0.98) !important;
    border: 1px solid ${C.borderBright};
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.42), 0 0 18px ${C.accentGlow};
  }

  .district-select-popup .ant-select-item {
    min-height: 32px;
    border-radius: 6px;
    color: ${C.textBright} !important;
  }

  .district-select-popup .ant-select-item-option-content {
    color: inherit !important;
    font-weight: 600;
    letter-spacing: 0.03em;
  }

  .district-select-popup .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
    background: rgba(0, 195, 255, 0.16) !important;
    color: #ffffff !important;
  }

  .district-select-popup .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
    background: rgba(0, 255, 184, 0.18) !important;
    color: ${C.accent2} !important;
  }

  .district-select-popup .ant-select-item-option-selected .ant-select-item-option-state {
    color: ${C.accent2};
  }
`;

// ── Small reusable components ───────────────────────────────────────────────

function Corner({pos}) {
  return (
    <div style={{position: "absolute", width: 14, height: 14, animation: "dd-corner 3s ease-in-out infinite", ...pos}}>
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
      animation: "dd-pulse 4s ease-in-out infinite",
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

function KpiStrip({district}) {
  const items = [
    {label: "课程达标率", value: district["课程落实"]["达标率"].toFixed(1), unit: "%", color: C.accent},
    {label: "课后服务比例", value: district["课后服务"]["比例"].toFixed(1), unit: "%", color: C.accent2},
    {label: "科学副校长配备率", value: district["科学副校长"]["配备率"].toFixed(1), unit: "%", color: C.accent3},
    {label: "科技辅导员配备率", value: district["科技辅导员"]["配备率"].toFixed(1), unit: "%", color: "#b388ff"},
    {label: "机构结对比例", value: district["机构结对"]["结对比例"].toFixed(1), unit: "%", color: "#ff8a65"},
    {label: "理工科背景占比", value: district["教师专业背景"]["理工科背景占比"].toFixed(1), unit: "%", color: "#69c0ff"},
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
          animation: "dd-in 0.5s ease both",
          animationDelay: `${i * 0.09}s`,
        }}>
          <div style={{position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${kpi.color}88, transparent)`}} />
          <div style={{fontSize: 11, color: C.text, letterSpacing: "0.05em"}}>{kpi.label}</div>
          <div style={{display: "flex", alignItems: "baseline", gap: 3, marginTop: 4}}>
            <span style={{fontSize: 22, fontWeight: 700, color: kpi.color, fontVariantNumeric: "tabular-nums", animation: "dd-glow 3s ease-in-out infinite"}}>{kpi.value}</span>
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
      <div style={{fontSize: 24, fontWeight: 700, color: C.accent, fontVariantNumeric: "tabular-nums", letterSpacing: "0.08em", animation: "dd-glow 2s ease-in-out infinite", lineHeight: 1}}>
        {pad(time.getHours())}<span style={{opacity: 0.5}}>:</span>{pad(time.getMinutes())}<span style={{opacity: 0.5, fontSize: 18}}>:{pad(time.getSeconds())}</span>
      </div>
      <div style={{fontSize: 11, color: C.text, marginTop: 3}}>
        {time.toLocaleDateString("zh-CN", {year: "numeric", month: "long", day: "numeric", weekday: "long"})}
      </div>
    </div>
  );
}

// ── Chart option builders ───────────────────────────────────────────────────

function getLabFreqOption(district) {
  const data = district["实验室使用频率"];
  const categories = ["几乎没有", "每学期1-2次", "每月1-2次", "每周1-2次", "每周3次及以上"];
  const colors = ["#ff4d4f", "#fa8c16", "#fadb14", "#52c41a", C.accent];
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(3,20,50,0.92)",
      borderColor: C.borderBright,
      textStyle: {color: C.textBright, fontSize: 12},
      formatter: p => `${p.name}<br/>${p.value.toFixed(1)}% (${p.percent}%)`,
    },
    legend: {
      orient: "vertical",
      right: 6,
      top: "center",
      textStyle: {color: C.text, fontSize: 9},
      itemWidth: 8,
      itemHeight: 8,
    },
    series: [{
      type: "pie",
      radius: ["40%", "65%"],
      center: ["42%", "50%"],
      data: categories.map((cat, i) => ({
        name: cat,
        value: data[cat] || 0,
        itemStyle: {color: colors[i], shadowBlur: 10, shadowColor: colors[i] + "88"},
      })),
      label: {
        show: true,
        formatter: p => p.value > 5 ? `${p.value.toFixed(0)}%` : "",
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
      },
      emphasis: {
        label: {show: true, color: "#fff", fontSize: 13, fontWeight: "bold"},
        itemStyle: {shadowBlur: 20},
      },
    }],
  };
}

function getTeachingDifficultyOption(district) {
  const keys = ["实验场地和设备不足", "耗材经费有限", "教师实验教学能力有待提升", "课时不够", "安全隐患问题"];
  const shortNames = ["场地设备不足", "耗材经费有限", "教师能力提升", "课时不够", "安全隐患"];
  const distData = keys.map(k => district["实验教学困难"][k] || 0);
  const cityData = keys.map(k => CITY_DATA["实验教学困难"]["整体"][k] || 0);
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(3,20,50,0.92)",
      borderColor: C.borderBright,
      textStyle: {color: C.textBright, fontSize: 11},
    },
    legend: {
      bottom: 2,
      textStyle: {color: C.text, fontSize: 10},
      data: ["本区", "全市平均"],
      itemWidth: 10,
      itemHeight: 10,
    },
    radar: {
      indicator: shortNames.map(name => ({name, max: 100})),
      shape: "polygon",
      center: ["50%", "50%"],
      radius: "60%",
      axisName: {color: C.text, fontSize: 10},
      splitArea: {areaStyle: {color: [
        "rgba(0,195,255,0.02)", "rgba(0,195,255,0.04)",
        "rgba(0,195,255,0.06)", "rgba(0,195,255,0.08)", "rgba(0,195,255,0.10)",
      ]}},
      splitLine: {lineStyle: {color: "rgba(0,195,255,0.15)"}},
      axisLine: {lineStyle: {color: "rgba(0,195,255,0.2)"}},
    },
    series: [{
      type: "radar",
      data: [
        {
          name: "本区",
          value: distData,
          symbol: "circle",
          symbolSize: 5,
          itemStyle: {color: C.accent},
          lineStyle: {color: C.accent, width: 2},
          areaStyle: {color: "rgba(0,195,255,0.18)"},
        },
        {
          name: "全市平均",
          value: cityData,
          symbol: "circle",
          symbolSize: 4,
          itemStyle: {color: C.accent3},
          lineStyle: {color: C.accent3, width: 1.5, type: "dashed"},
          areaStyle: {color: "rgba(255,209,102,0.08)"},
        },
      ],
    }],
  };
}

function getEquipmentUpdateOption(district) {
  const data = district["实验器材更新"];
  const items = [
    {name: "每年更新", color: C.accent2},
    {name: "不定期更新", color: C.accent},
    {name: "近三年未更新", color: C.accent3},
    {name: "从未更新", color: "#ff4d4f"},
  ];
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(3,20,50,0.92)",
      borderColor: C.borderBright,
      textStyle: {color: C.textBright, fontSize: 12},
      formatter: p => `${p.name}: ${p.value.toFixed(1)}%`,
    },
    legend: {
      orient: "vertical",
      right: 6,
      top: "center",
      textStyle: {color: C.text, fontSize: 9},
      itemWidth: 8,
      itemHeight: 8,
    },
    series: [{
      type: "pie",
      radius: ["40%", "65%"],
      center: ["42%", "50%"],
      data: items.map(item => ({
        name: item.name,
        value: data[item.name] || 0,
        itemStyle: {color: item.color, shadowBlur: 10, shadowColor: item.color + "88"},
      })),
      label: {
        show: true,
        formatter: p => p.value > 5 ? `${p.value.toFixed(0)}%` : "",
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
      },
      emphasis: {
        label: {show: true, color: "#fff", fontSize: 13, fontWeight: "bold"},
        itemStyle: {shadowBlur: 20},
      },
    }],
  };
}

function getLabBuildingOption(district) {
  const data = district["实验室建设"];
  const grades = ["小学", "初中", "高中"];
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {type: "shadow"},
      backgroundColor: "rgba(3,20,50,0.92)",
      borderColor: C.borderBright,
      textStyle: {color: C.textBright, fontSize: 11},
      formatter: params => `${params[0].axisValue}<br/>` + params.map(p => `${p.marker}${p.seriesName}: ${p.value.toFixed(1)}%`).join("<br/>"),
    },
    legend: {
      bottom: 2,
      textStyle: {color: C.text, fontSize: 10},
      itemWidth: 10,
      itemHeight: 10,
    },
    grid: {top: 14, bottom: 42, left: 16, right: 16, containLabel: true},
    xAxis: {
      type: "category",
      data: grades,
      axisLabel: {color: C.text, fontSize: 11},
      axisTick: {show: false},
      axisLine: {lineStyle: {color: C.border}},
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: {color: "#607080", fontSize: 9, formatter: v => `${v}%`},
      splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
    },
    series: [
      {
        name: "实验室间数达标率",
        type: "bar",
        barGap: "15%",
        barCategoryGap: "30%",
        data: grades.map(g => ({
          value: data["实验室间数达标率"][g] || 0,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: C.accent},
              {offset: 1, color: "#004466"},
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        })),
        label: {show: true, position: "top", color: C.accent, fontSize: 9, formatter: p => `${p.value.toFixed(0)}%`},
      },
      {
        name: "生均面积达标率",
        type: "bar",
        data: grades.map(g => ({
          value: data["生均使用面积达标率"][g] || 0,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: C.accent2},
              {offset: 1, color: "#004433"},
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        })),
        label: {show: true, position: "top", color: C.accent2, fontSize: 9, formatter: p => `${p.value.toFixed(0)}%`},
      },
    ],
  };
}

function getActivitiesOption(district) {
  const jinlai = district["请进来活动"];
  const zhuqu = district["走出去活动"];
  const cityJinlai = CITY_DATA["请进来活动"]["整体"];
  const cityZhuqu = CITY_DATA["走出去活动"]["整体"];

  const jinlaiEntries = Object.entries(jinlai);
  const zhuquEntries = Object.entries(zhuqu);
  const allEntries = [...jinlaiEntries, ...zhuquEntries];
  const jinlaiCount = jinlaiEntries.length;

  const names = allEntries.map(([k]) => k);
  const distValues = allEntries.map(([, v]) => v);
  const cityValues = allEntries.map(([k]) => {
    if (k in cityJinlai) {return cityJinlai[k];}
    if (k in cityZhuqu) {return cityZhuqu[k];}
    return 0;
  });

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
        return `${names[idx]}<br/>` + params.map(p => `${p.marker}${p.seriesName}: ${p.value.toFixed(1)}%`).join("<br/>");
      },
    },
    legend: {
      right: 5,
      top: 0,
      textStyle: {color: C.text, fontSize: 10},
      itemWidth: 10,
      itemHeight: 10,
    },
    grid: {top: 24, bottom: 6, left: 8, right: 8, containLabel: true},
    xAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: {color: "#607080", fontSize: 8, formatter: v => `${v}%`},
      splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
    },
    yAxis: {
      type: "category",
      data: names,
      axisLabel: {color: C.text, fontSize: 9},
      axisTick: {show: false},
      axisLine: {lineStyle: {color: C.border}},
    },
    series: [
      {
        name: "本区",
        type: "bar",
        barMaxWidth: 9,
        data: distValues.map((v, i) => ({
          value: v,
          itemStyle: {
            color: i < jinlaiCount
              ? new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: C.accent}, {offset: 1, color: "#003355"}])
              : new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: C.accent2}, {offset: 1, color: "#003322"}]),
            borderRadius: [0, 3, 3, 0],
          },
        })),
        label: {
          show: true,
          position: "right",
          color: C.text,
          fontSize: 8,
          formatter: p => `${p.value.toFixed(0)}%`,
        },
      },
      {
        name: "全市平均",
        type: "bar",
        barMaxWidth: 9,
        data: cityValues.map(v => ({
          value: v,
          itemStyle: {color: "rgba(255,209,102,0.35)", borderRadius: [0, 3, 3, 0]},
        })),
      },
    ],
  };
}

function getRankingOption(districts, selected) {
  const sorted = [...districts].sort((a, b) => a["课程落实"]["达标率"] - b["课程落实"]["达标率"]);
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {type: "shadow"},
      backgroundColor: "rgba(3,20,50,0.92)",
      borderColor: C.borderBright,
      textStyle: {color: C.textBright, fontSize: 11},
      formatter: p => `${p[0].name}：课程达标率 ${p[0].value.toFixed(1)}%`,
    },
    grid: {top: 6, bottom: 6, left: 8, right: 50, containLabel: true},
    xAxis: {
      type: "value",
      min: 85,
      max: 100,
      axisLabel: {color: "#607080", fontSize: 8, formatter: v => `${v}%`},
      splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
    },
    yAxis: {
      type: "category",
      data: sorted.map(d => d["名称"]),
      axisLabel: {
        color: name => name === selected ? C.accent : C.text,
        fontSize: 9,
        fontWeight: name => name === selected ? "bold" : "normal",
      },
      axisTick: {show: false},
      axisLine: {lineStyle: {color: C.border}},
    },
    series: [{
      type: "bar",
      barMaxWidth: 11,
      data: sorted.map(d => ({
        value: d["课程落实"]["达标率"],
        itemStyle: {
          color: d["名称"] === selected
            ? new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: C.accent}, {offset: 1, color: "#004466"}])
            : new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: "#1565c088"}, {offset: 1, color: "#0a254066"}]),
          borderRadius: [0, 3, 3, 0],
          shadowBlur: d["名称"] === selected ? 10 : 0,
          shadowColor: d["名称"] === selected ? C.accent : "transparent",
        },
      })),
      label: {show: true, position: "right", color: C.text, fontSize: 8, formatter: p => `${p.value.toFixed(1)}%`},
    }],
  };
}

// ── Main page ───────────────────────────────────────────────────────────────

class DashboardDistrictPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDistrict: getInitialDistrict(props),
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

  componentDidUpdate(prevProps) {
    if (prevProps.account?.displayName === this.props.account?.displayName) {
      return;
    }

    const accountDistrict = getAccountDistrict(this.props.account);
    if (accountDistrict && accountDistrict["名称"] !== this.state.selectedDistrict?.["名称"]) {
      this.setState({selectedDistrict: accountDistrict});
    }
  }

  componentWillUnmount() {
    clearInterval(this.clockTimer);
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
  }

  onDistrictChange = name => {
    const accountDistrict = getAccountDistrict(this.props.account);
    if (accountDistrict) {
      this.setState({selectedDistrict: accountDistrict});
      return;
    }

    const selectedDistrict = getDistrictByName(name);
    if (selectedDistrict) {
      localStorage.setItem("dashboard_district", name);
      this.setState({selectedDistrict});
    }
  };

  render() {
    const {selectedDistrict, time, isFullscreen} = this.state;
    const accountDistrict = getAccountDistrict(this.props.account);
    const isDistrictAccount = !!accountDistrict;
    const selectableDistricts = isDistrictAccount ? [accountDistrict] : DISTRICTS_DATA;
    const districtName = selectedDistrict["名称"];
    const CHART_H = 252;

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
          animation: "dd-grid 12s linear infinite",
        }} />

        {/* scan line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 100,
          background: "linear-gradient(180deg, transparent, rgba(0,195,255,0.06), transparent)",
          pointerEvents: "none", zIndex: 1,
          animation: "dd-scan 6s linear infinite",
        }} />

        <div style={{position: "relative", zIndex: 2}}>

          {/* ── Header ── */}
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14}}>
            <div style={{display: "flex", alignItems: "center", gap: 16}}>
              <div>
                <div style={{fontSize: 20, fontWeight: 800, color: C.textBright, letterSpacing: "0.06em", lineHeight: 1}}>
                  {districtName} · 科学教育数据大屏
                </div>
                <div style={{fontSize: 11, color: C.text, marginTop: 4, letterSpacing: "0.08em"}}>
                  2025年中小学科学教育工作诊断 — 北京市区县数据
                </div>
              </div>
              <Select
                className="district-select-trigger"
                popupClassName="district-select-popup"
                classNames={{popup: {root: "district-select-popup"}}}
                value={districtName}
                onChange={this.onDistrictChange}
                disabled={isDistrictAccount}
                style={{width: 170}}
                popupMatchSelectWidth={false}
                variant="borderless"
                options={selectableDistricts.map(d => ({value: d["名称"], label: d["名称"]}))}
                dropdownStyle={{background: "#061c3a", border: `1px solid ${C.border}`}}
                labelRender={({label}) => (
                  <span style={{
                    color: C.accent,
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: "0.04em",
                    background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>{label} ▾</span>
                )}
              />
            </div>

            <div style={{display: "flex", alignItems: "center", gap: 16}}>
              <div style={{textAlign: "center"}}>
                <div style={{fontSize: 11, color: C.text, letterSpacing: "0.06em"}}>报告期</div>
                <div style={{fontSize: 12, color: C.accent2, fontWeight: 600, marginTop: 2}}>2025年度</div>
              </div>
              <div style={{width: 1, height: 34, background: C.border}} />
              <Clock time={time} />
              <div style={{width: 1, height: 34, background: C.border}} />
              <button
                onClick={() => this.props.history.push(`/district-report/${encodeURIComponent(districtName)}`)}
                title="查看诊断报告"
                style={{
                  background: "rgba(0,255,184,0.10)",
                  border: "1px solid rgba(0,255,184,0.45)",
                  borderRadius: 6,
                  color: C.accent2,
                  cursor: "pointer",
                  padding: "5px 12px",
                  fontSize: 13,
                  transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                  lineHeight: 1.4,
                  fontWeight: 600,
                }}
                onMouseEnter={e => {e.currentTarget.style.borderColor = C.accent2; e.currentTarget.style.boxShadow = "0 0 12px rgba(0,255,184,0.35)"; e.currentTarget.style.background = "rgba(0,255,184,0.18)";}}
                onMouseLeave={e => {e.currentTarget.style.borderColor = "rgba(0,255,184,0.45)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "rgba(0,255,184,0.10)";}}
              >
                📄 诊断报告
              </button>
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
          <KpiStrip district={selectedDistrict} />

          {/* ── Row 1: 实验室使用频率 | 教学困难雷达 | 器材更新 ── */}
          <div style={{display: "flex", gap: 13, marginBottom: 13, alignItems: "flex-start"}}>
            <Panel style={{flex: 1}}>
              <PanelTitle>实验室使用频率分布</PanelTitle>
              <ReactECharts
                option={getLabFreqOption(selectedDistrict)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>

            <Panel style={{flex: 1.3}} glow>
              <PanelTitle>实验教学困难分析（本区 vs 全市平均）</PanelTitle>
              <ReactECharts
                option={getTeachingDifficultyOption(selectedDistrict)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>

            <Panel style={{flex: 1}}>
              <PanelTitle>实验器材更新情况</PanelTitle>
              <ReactECharts
                option={getEquipmentUpdateOption(selectedDistrict)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>
          </div>

          {/* ── Row 2: 实验室建设 | 校外活动 | 全区排行 ── */}
          <div style={{display: "flex", gap: 13, alignItems: "flex-start"}}>
            <Panel style={{flex: 1}}>
              <PanelTitle>实验室建设达标率（按学段）</PanelTitle>
              <ReactECharts
                option={getLabBuildingOption(selectedDistrict)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>

            <Panel style={{flex: 1.5}}>
              <PanelTitle>校外活动参与率（请进来 · 走出去）</PanelTitle>
              <ReactECharts
                option={getActivitiesOption(selectedDistrict)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>

            <Panel style={{flex: 1.2}}>
              <PanelTitle>全区课程达标率排行</PanelTitle>
              <ReactECharts
                option={getRankingOption(DISTRICTS_DATA, districtName)}
                style={{height: CHART_H}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>
          </div>

        </div>
      </div>
    );
  }
}

export default withRouter(DashboardDistrictPage);
