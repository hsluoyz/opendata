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
import {Spin} from "antd";
import DashboardData from "./DashboardData.json";

// ── Real data extraction ──────────────────────────────────────────────────────
const meta = DashboardData["元数据"];
const cityData = DashboardData["市级数据"];
const districtDataRaw = DashboardData["区县数据"];

const DISTRICT_CENTERS = {
  "东城区": [116.418, 39.917], "西城区": [116.366, 39.912],
  "朝阳区": [116.586, 39.921], "丰台区": [116.287, 39.858],
  "石景山区": [116.222, 39.914], "海淀区": [116.298, 39.959],
  "门头沟区": [116.101, 39.940], "房山区": [116.143, 39.748],
  "通州区": [116.757, 39.909], "顺义区": [116.655, 40.130],
  "昌平区": [116.231, 40.221], "大兴区": [116.341, 39.729],
  "怀柔区": [116.632, 40.316], "平谷区": [117.121, 40.141],
  "密云区": [116.843, 40.477], "延庆区": [115.975, 40.465],
  "北京经济技术开发区": [116.506, 39.796], "燕山地区": [115.920, 39.700],
};

const DISTRICT_DATA = districtDataRaw.map(d => ({
  name: d.name,
  value: d["课程落实"]["达标率"],
  teachers: (d["教师人数"]["小学"] || 0) + (d["教师人数"]["初中"] || 0) + (d["教师人数"]["高中"] || 0),
  center: DISTRICT_CENTERS[d.name] || [116.4, 40.0],
  raw: d,
}));

const RANKED_BY_RATE = [...DISTRICT_DATA].sort((a, b) => b.value - a.value);

// Pre-compute teaching type averages by school level for radar chart
const teachingTypes = cityData["实验教学类型"];
const TYPE_KEYS = ["学生必做实验", "教师演示实验", "跨学科实践活动", "新技术实验"];
const avgTypes = subjects => TYPE_KEYS.map(k => {
  const sum = subjects.reduce((a, s) => a + teachingTypes[s][k], 0);
  return Math.round(sum / subjects.length * 10) / 10;
});
const TEACH_ELEM = TYPE_KEYS.map(k => teachingTypes["小学科学"][k]);
const TEACH_JUNIOR = avgTypes(["初中物理", "初中化学", "初中生物学", "初中地理"]);
const TEACH_SENIOR = avgTypes(["高中物理", "高中化学", "高中生物学", "高中地理"]);

// Combined activities list sorted ascending (for horizontal bar bottom-to-top)
const ALL_ACTIVITIES = [
  ...Object.entries(cityData["请进来活动"]["整体"]).map(([name, val]) => ({name, val, type: "invite"})),
  ...Object.entries(cityData["走出去活动"]["整体"]).map(([name, val]) => ({name, val, type: "goout"})),
].sort((a, b) => a.val - b.val);

// ── Design tokens ─────────────────────────────────────────────────────────────
const COLORS = {
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
  mapArea: "#0a2540",
  mapBorder: "#1a6da8",
  mapHighlightGlow: "rgba(0, 195, 255, 0.6)",
};

const ANIMATION_STYLES = `
  @keyframes db-scan {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes db-pulse-border {
    0%, 100% { box-shadow: 0 0 8px rgba(0,195,255,0.3), inset 0 0 8px rgba(0,195,255,0.05); }
    50%       { box-shadow: 0 0 20px rgba(0,195,255,0.6), inset 0 0 16px rgba(0,195,255,0.12); }
  }
  @keyframes db-corner-spin {
    0%   { opacity: 0.4; }
    50%  { opacity: 1; }
    100% { opacity: 0.4; }
  }
  @keyframes db-count-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes db-glow-text {
    0%, 100% { text-shadow: 0 0 8px rgba(0,195,255,0.5); }
    50%       { text-shadow: 0 0 22px rgba(0,195,255,1), 0 0 40px rgba(0,195,255,0.5); }
  }
  @keyframes db-rank-slide {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes db-grid-move {
    0%   { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }
`;

// ── Helper components ─────────────────────────────────────────────────────────

function Corner({pos}) {
  const size = 16, thickness = 2, color = COLORS.accent;
  const style = {position: "absolute", width: size, height: size, animation: "db-corner-spin 3s ease-in-out infinite", ...pos};
  const h = {position: "absolute", background: color, height: thickness, width: "100%"};
  const v = {position: "absolute", background: color, width: thickness, height: "100%"};
  const isRight = pos.right !== undefined, isBottom = pos.bottom !== undefined;
  return (
    <div style={style}>
      <div style={{...h, top: isBottom ? undefined : 0, bottom: isBottom ? 0 : undefined}} />
      <div style={{...v, left: isRight ? undefined : 0, right: isRight ? 0 : undefined}} />
    </div>
  );
}

function Panel({children, style, glow}) {
  return (
    <div style={{
      background: COLORS.panelBg,
      border: `1px solid ${glow ? COLORS.borderBright : COLORS.border}`,
      borderRadius: 8,
      padding: "14px 16px",
      position: "relative",
      animation: "db-pulse-border 4s ease-in-out infinite",
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
    <div style={{
      fontSize: 12, fontWeight: 700, color: COLORS.accent,
      letterSpacing: "0.12em", textTransform: "uppercase",
      marginBottom: 12, display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{display: "inline-block", width: 3, height: 12, background: COLORS.accent, borderRadius: 2}} />
      {children}
    </div>
  );
}

function RateBar({rank, name, rate, delay}) {
  const rankColor = rank === 1 ? "#ffd166" : rank === 2 ? "#c0c0c0" : rank === 3 ? "#cd7f32" : COLORS.accent;
  const barColor = rate >= 100 ? COLORS.accent2 : rate >= 97 ? COLORS.accent : rate >= 93 ? COLORS.accent3 : "#ff8888";
  return (
    <div style={{marginBottom: 6, animation: "db-rank-slide 0.5s ease both", animationDelay: delay}}>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 11}}>
        <span style={{color: COLORS.textBright, display: "flex", alignItems: "center", gap: 2}}>
          <span style={{color: rankColor, fontWeight: 700, minWidth: 18, display: "inline-block", fontSize: 10}}>{rank}</span>
          <span style={{fontSize: 10, color: COLORS.text}}>{name}</span>
        </span>
        <span style={{color: barColor, fontWeight: 600, fontSize: 10}}>{rate.toFixed(1)}%</span>
      </div>
      <div style={{height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden"}}>
        <div style={{
          height: "100%", width: `${rate}%`,
          background: `linear-gradient(90deg, ${barColor}55, ${barColor})`,
          borderRadius: 3, transition: "width 1.2s ease",
          boxShadow: `0 0 4px ${barColor}55`,
        }} />
      </div>
    </div>
  );
}

function Clock({time}) {
  const pad = n => String(n).padStart(2, "0");
  const [h, m, s] = [pad(time.getHours()), pad(time.getMinutes()), pad(time.getSeconds())];
  const dateStr = time.toLocaleDateString("zh-CN", {year: "numeric", month: "long", day: "numeric", weekday: "long"});
  return (
    <div style={{textAlign: "right"}}>
      <div style={{fontSize: 28, fontWeight: 700, color: COLORS.accent, fontVariantNumeric: "tabular-nums", letterSpacing: "0.08em", animation: "db-glow-text 2s ease-in-out infinite", lineHeight: 1}}>
        {h}<span style={{opacity: 0.6}}>:</span>{m}<span style={{opacity: 0.6, fontSize: 20}}>:{s}</span>
      </div>
      <div style={{fontSize: 11, color: COLORS.text, marginTop: 4}}>{dateStr}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

class DashboardCityPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {geoLoaded: false, loadError: false, time: new Date(), isFullscreen: false};
    this.chartRef = React.createRef();
    this.containerRef = React.createRef();
  }

  onFullscreenChange = () => this.setState({isFullscreen: !!document.fullscreenElement});

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
    fetch("https://geo.datav.aliyun.com/areas_v3/bound/110000_full.json")
      .then(r => r.json())
      .then(geo => {echarts.registerMap("beijing_districts", geo); this.setState({geoLoaded: true});})
      .catch(() => this.setState({loadError: true}));
  }

  componentWillUnmount() {
    clearInterval(this.clockTimer);
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
  }

  // ── Chart options ───────────────────────────────────────────────────────────

  getMapOption() {
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(3, 20, 50, 0.92)",
        borderColor: COLORS.borderBright,
        borderWidth: 1,
        padding: [10, 14],
        textStyle: {color: COLORS.textBright, fontSize: 12},
        formatter: params => {
          const d = DISTRICT_DATA.find(x => x.name === params.name);
          if (!d) {return params.name || "";}
          const r = d.raw;
          return [
            `<div style="font-weight:700;font-size:14px;color:${COLORS.accent};margin-bottom:6px">${d.name}</div>`,
            `<div style="color:${COLORS.text}">课程达标率：<span style="color:#fff;font-weight:600">${d.value.toFixed(1)}%</span></div>`,
            `<div style="color:${COLORS.text}">科学副校长配备：<span style="color:#fff;font-weight:600">${r["科学副校长"]["配备率"]}%</span></div>`,
            `<div style="color:${COLORS.text}">专职教师率（初中）：<span style="color:#fff;font-weight:600">${r["专职率"]["初中"]}%</span></div>`,
            `<div style="color:${COLORS.text}">机构结对率：<span style="color:#fff;font-weight:600">${r["机构结对"]["结对比例"]}%</span></div>`,
            `<div style="color:${COLORS.text}">教师总数：<span style="color:#fff;font-weight:600">${d.teachers.toLocaleString()} 人</span></div>`,
          ].join("");
        },
      },
      visualMap: {
        min: 85, max: 100,
        show: false,
        inRange: {color: ["#0a2540", "#0d3566", "#0f4a8a", "#1565c0", "#1976d2"]},
      },
      geo: {
        map: "beijing_districts",
        roam: true,
        zoom: 1.15,
        center: [116.4, 40.1],
        label: {show: true, color: "#8ec5de", fontSize: 10, fontWeight: "500"},
        itemStyle: {
          areaColor: COLORS.mapArea,
          borderColor: COLORS.mapBorder,
          borderWidth: 1.2,
          shadowColor: "rgba(0, 100, 200, 0.4)",
          shadowBlur: 8,
        },
        emphasis: {
          label: {show: true, color: "#ffffff", fontSize: 12, fontWeight: "bold"},
          itemStyle: {areaColor: "#1565c0", borderColor: COLORS.accent, borderWidth: 2, shadowColor: COLORS.mapHighlightGlow, shadowBlur: 20},
        },
        select: {disabled: true},
      },
      series: [
        {
          name: "课程落实达标率",
          type: "map",
          map: "beijing_districts",
          geoIndex: 0,
          data: DISTRICT_DATA,
        },
        {
          name: "教师规模",
          type: "effectScatter",
          coordinateSystem: "geo",
          data: DISTRICT_DATA.map(d => ({name: d.name, value: [...d.center, d.teachers]})),
          symbolSize: d => Math.max(4, Math.sqrt(d[2]) * 0.55),
          showEffectOn: "render",
          rippleEffect: {brushType: "stroke", scale: 3.5, period: 3.5, color: COLORS.accent},
          itemStyle: {color: COLORS.accent, shadowBlur: 12, shadowColor: COLORS.accent},
          zlevel: 2,
        },
      ],
    };
  }

  getSchoolTypePieOption() {
    const palette = ["#00c3ff", "#00ffb8", "#ffd166", "#b388ff", "#ff6e6e", "#29c7c7"];
    const data = Object.entries(meta["学校构成"]["按类型"]).map(([name, value], i) => ({
      name, value, itemStyle: {color: palette[i]},
    }));
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(3,20,50,0.92)",
        borderColor: COLORS.borderBright,
        textStyle: {color: COLORS.textBright, fontSize: 12},
        formatter: p => `${p.name}<br/>${p.value} 所 &nbsp;(${p.percent}%)`,
      },
      series: [{
        type: "pie",
        radius: ["36%", "62%"],
        center: ["50%", "52%"],
        data,
        label: {
          show: true, color: COLORS.text, fontSize: 9,
          formatter: p => `${p.name.slice(0, 5)}\n${p.value}`,
        },
        labelLine: {length: 6, length2: 8, lineStyle: {color: COLORS.border}},
        emphasis: {itemStyle: {shadowBlur: 12, shadowColor: "rgba(0,0,0,0.5)"}},
      }],
    };
  }

  getDifficultiesOption() {
    const entries = Object.entries(cityData["实验教学困难"]["整体"]).sort((a, b) => a[1] - b[1]);
    const palette = ["#00c3ff", "#00ffb8", "#ffd166", "#ffa566", "#ff6e6e"];
    return {
      backgroundColor: "transparent",
      grid: {top: 4, bottom: 16, left: 4, right: 46, containLabel: true},
      xAxis: {
        type: "value", min: 0, max: 100,
        axisLabel: {color: "#607080", fontSize: 8, formatter: v => v + "%"},
        splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
      },
      yAxis: {
        type: "category",
        data: entries.map(e => e[0]),
        axisLabel: {color: COLORS.text, fontSize: 9, width: 76, overflow: "truncate"},
        axisTick: {show: false},
        axisLine: {lineStyle: {color: COLORS.border}},
      },
      series: [{
        type: "bar",
        barMaxWidth: 12,
        data: entries.map(([, val], i) => ({
          value: val,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              {offset: 0, color: palette[i]},
              {offset: 1, color: palette[i] + "33"},
            ]),
            borderRadius: [0, 4, 4, 0],
          },
        })),
        label: {show: true, position: "right", color: COLORS.text, fontSize: 9, formatter: p => p.value.toFixed(1) + "%"},
      }],
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(3,20,50,0.92)",
        borderColor: COLORS.borderBright,
        textStyle: {color: COLORS.textBright},
        formatter: p => `${p[0].name}<br/>${p[0].value.toFixed(1)}%`,
      },
    };
  }

  getEquipUpdateOption() {
    const palette = ["#00ffb8", "#00c3ff", "#ffd166", "#ff6e6e"];
    const data = Object.entries(cityData["实验器材更新"]["整体"]).map(([name, value], i) => ({
      name, value, itemStyle: {color: palette[i]},
    }));
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(3,20,50,0.92)",
        borderColor: COLORS.borderBright,
        textStyle: {color: COLORS.textBright, fontSize: 12},
        formatter: p => `${p.name}<br/>${p.value}%`,
      },
      series: [{
        type: "pie",
        radius: ["35%", "60%"],
        center: ["50%", "50%"],
        data,
        label: {show: true, color: COLORS.text, fontSize: 9, formatter: p => `${p.name}\n${p.value}%`},
        labelLine: {length: 5, length2: 6, lineStyle: {color: COLORS.border}},
        emphasis: {itemStyle: {shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)"}},
      }],
    };
  }

  getTeachingRadarOption() {
    const indicators = [
      {name: "学生\n必做实验", max: 100},
      {name: "教师\n演示实验", max: 100},
      {name: "跨学科\n实践活动", max: 100},
      {name: "新技术\n实验", max: 100},
    ];
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(3,20,50,0.92)",
        borderColor: COLORS.borderBright,
        textStyle: {color: COLORS.textBright, fontSize: 12},
      },
      legend: {
        data: ["小学科学", "初中(均值)", "高中(均值)"],
        bottom: 0,
        textStyle: {color: COLORS.text, fontSize: 10},
        itemWidth: 14, itemHeight: 6,
      },
      radar: {
        indicator: indicators,
        shape: "polygon",
        radius: "58%",
        center: ["50%", "46%"],
        splitNumber: 4,
        axisName: {color: COLORS.text, fontSize: 10},
        splitLine: {lineStyle: {color: "rgba(0,195,255,0.1)"}},
        splitArea: {show: false},
        axisLine: {lineStyle: {color: "rgba(0,195,255,0.15)"}},
      },
      series: [{
        type: "radar",
        data: [
          {
            name: "小学科学", value: TEACH_ELEM,
            areaStyle: {color: "rgba(0,195,255,0.1)"},
            lineStyle: {color: COLORS.accent, width: 2},
            itemStyle: {color: COLORS.accent},
          },
          {
            name: "初中(均值)", value: TEACH_JUNIOR,
            areaStyle: {color: "rgba(0,255,184,0.1)"},
            lineStyle: {color: COLORS.accent2, width: 2},
            itemStyle: {color: COLORS.accent2},
          },
          {
            name: "高中(均值)", value: TEACH_SENIOR,
            areaStyle: {color: "rgba(255,209,102,0.1)"},
            lineStyle: {color: COLORS.accent3, width: 2},
            itemStyle: {color: COLORS.accent3},
          },
        ],
      }],
    };
  }

  getActivitiesOption() {
    const inviteColor = COLORS.accent;
    const gooutColor = COLORS.accent2;
    return {
      backgroundColor: "transparent",
      grid: {top: 4, bottom: 4, left: 4, right: 46, containLabel: true},
      xAxis: {
        type: "value", min: 0, max: 100,
        axisLabel: {color: "#607080", fontSize: 8, formatter: v => v + "%"},
        splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
      },
      yAxis: {
        type: "category",
        data: ALL_ACTIVITIES.map(d => d.name),
        axisLabel: {color: COLORS.text, fontSize: 9},
        axisTick: {show: false},
        axisLine: {lineStyle: {color: COLORS.border}},
      },
      series: [{
        type: "bar",
        barMaxWidth: 10,
        data: ALL_ACTIVITIES.map(d => ({
          value: d.val,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              {offset: 0, color: d.type === "invite" ? inviteColor : gooutColor},
              {offset: 1, color: (d.type === "invite" ? inviteColor : gooutColor) + "33"},
            ]),
            borderRadius: [0, 4, 4, 0],
          },
        })),
        label: {show: true, position: "right", color: COLORS.text, fontSize: 8, formatter: p => p.value.toFixed(0) + "%"},
      }],
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(3,20,50,0.92)",
        borderColor: COLORS.borderBright,
        textStyle: {color: COLORS.textBright},
        formatter: p => {
          const act = ALL_ACTIVITIES.find(a => a.name === p[0].name);
          const tag = act?.type === "invite" ? "请进来" : "走出去";
          return `${p[0].name} <span style="color:${act?.type === "invite" ? inviteColor : gooutColor}">[${tag}]</span><br/>${p[0].value.toFixed(1)}%`;
        },
      },
    };
  }

  getFundingOption() {
    const inv = cityData["经费投入"];
    const total = inv["省级总投入万元"];
    const growth = inv["同比增加万元"];
    const fundItems = [
      {name: "科技活动", value: inv["科技活动经费万元"], itemStyle: {color: COLORS.accent2}},
      {name: "仪器购置", value: inv["仪器购置经费万元"], itemStyle: {color: COLORS.accent}},
      {name: "教师培训", value: inv["教师培训经费万元"], itemStyle: {color: COLORS.accent3}},
    ];
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(3,20,50,0.92)",
        borderColor: COLORS.borderBright,
        textStyle: {color: COLORS.textBright, fontSize: 12},
        formatter: p => `${p.name}<br/>${p.value.toFixed(1)} 万元&nbsp;&nbsp;${p.percent}%`,
      },
      graphic: [
        {
          type: "text",
          left: "center", top: "33%",
          style: {text: total.toFixed(0), textAlign: "center", fill: COLORS.accent, fontSize: 15, fontWeight: "bold"},
        },
        {
          type: "text",
          left: "center", top: "46%",
          style: {text: "万元", textAlign: "center", fill: COLORS.text, fontSize: 10},
        },
        {
          type: "text",
          left: "center", top: "56%",
          style: {
            text: `↑${growth.toFixed(0)}`,
            textAlign: "center", fill: COLORS.accent2, fontSize: 10,
          },
        },
      ],
      series: [{
        type: "pie",
        radius: ["40%", "62%"],
        center: ["50%", "46%"],
        data: fundItems,
        label: {
          show: true, color: COLORS.text, fontSize: 9,
          formatter: p => `${p.name}\n${p.value.toFixed(0)}万`,
        },
        labelLine: {length: 6, length2: 8, lineStyle: {color: COLORS.border}},
        emphasis: {itemStyle: {shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)"}},
      }],
    };
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  render() {
    const {geoLoaded, loadError, time, isFullscreen} = this.state;

    const kpis = [
      {label: "学校总数", value: meta["学校总数"].toLocaleString(), unit: "所", color: COLORS.accent, sub: `区县数 ${meta["区县总数"]}`},
      {label: "专职科学教师", value: cityData["专职教师"]["专职教师总数"].toLocaleString(), unit: "人", color: COLORS.accent2, sub: `专职率 ${cityData["专职教师"]["专职率"]}%`},
      {label: "课程落实达标率", value: cityData["课程落实"]["达标率"].toFixed(2), unit: "%", color: COLORS.accent3, sub: `同比 +${cityData["课程落实"]["同比变化"]}%`},
      {label: "科学副校长配备", value: cityData["科学副校长"]["配备率"].toFixed(1), unit: "%", color: "#b388ff", sub: `同比 +${cityData["科学副校长"]["同比变化"]}%`},
      {label: "课后服务覆盖", value: cityData["课后服务"]["比例"].toFixed(1), unit: "%", color: "#ff6e6e", sub: `同比 +${cityData["课后服务"]["同比变化"]}%`},
    ];

    return (
      <div ref={this.containerRef} style={{
        background: COLORS.bg,
        minHeight: isFullscreen ? "100vh" : "calc(100vh - 100px)",
        padding: "18px 20px 24px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
      }}>
        <style>{ANIMATION_STYLES}</style>

        {/* animated grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "linear-gradient(rgba(0,195,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,195,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "db-grid-move 12s linear infinite",
        }} />

        {/* scan line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 120,
          background: "linear-gradient(180deg, transparent, rgba(0,195,255,0.06), transparent)",
          pointerEvents: "none", zIndex: 1,
          animation: "db-scan 6s linear infinite",
        }} />

        <div style={{position: "relative", zIndex: 2}}>

          {/* ── Header ── */}
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
            <div>
              <div style={{fontSize: 22, fontWeight: 800, color: COLORS.textBright, letterSpacing: "0.06em", lineHeight: 1}}>
                北京市科学教育数据大屏
              </div>
              <div style={{fontSize: 11, color: COLORS.text, marginTop: 5, letterSpacing: "0.1em"}}>
                2025年中小学科学教育工作诊断报告 · {meta["报告日期"]}
              </div>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 20}}>
              <div style={{textAlign: "center"}}>
                <div style={{fontSize: 11, color: COLORS.text, letterSpacing: "0.08em"}}>数据来源</div>
                <div style={{fontSize: 12, color: COLORS.accent2, fontWeight: 600, marginTop: 2}}>省级诊断报告</div>
              </div>
              <div style={{width: 1, height: 36, background: COLORS.border}} />
              <Clock time={time} />
              <div style={{width: 1, height: 36, background: COLORS.border}} />
              <button
                onClick={this.toggleFullscreen}
                title={isFullscreen ? "退出全屏" : "全屏展示"}
                style={{
                  background: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  color: COLORS.accent,
                  cursor: "pointer",
                  padding: "5px 10px",
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  lineHeight: 1.4,
                }}
                onMouseEnter={e => {e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.boxShadow = `0 0 10px ${COLORS.accentGlow}`;}}
                onMouseLeave={e => {e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = "none";}}
              >
                {isFullscreen ? "⊠ 退出全屏" : "⛶ 全屏"}
              </button>
            </div>
          </div>

          {/* ── KPI strip ── */}
          <div style={{display: "flex", gap: 12, marginBottom: 16}}>
            {kpis.map((kpi, i) => (
              <div key={kpi.label} style={{
                flex: 1,
                background: COLORS.panelBg,
                border: `1px solid ${kpi.color}33`,
                borderRadius: 8,
                padding: "10px 14px",
                position: "relative",
                overflow: "hidden",
                animation: "db-count-in 0.5s ease both",
                animationDelay: `${i * 0.1}s`,
              }}>
                <div style={{position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${kpi.color}88, transparent)`}} />
                <div style={{fontSize: 10, color: COLORS.text, letterSpacing: "0.06em"}}>{kpi.label}</div>
                <div style={{display: "flex", alignItems: "baseline", gap: 3, marginTop: 2}}>
                  <span style={{fontSize: 22, fontWeight: 700, color: kpi.color, fontVariantNumeric: "tabular-nums"}}>{kpi.value}</span>
                  <span style={{fontSize: 11, color: COLORS.text}}>{kpi.unit}</span>
                </div>
                {kpi.sub && <div style={{fontSize: 10, color: COLORS.accent2, marginTop: 1, opacity: 0.8}}>{kpi.sub}</div>}
              </div>
            ))}
          </div>

          {/* ── Main 3-column layout ── */}
          <div style={{display: "flex", gap: 14, alignItems: "flex-start"}}>

            {/* Left column */}
            <div style={{width: 224, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12}}>
              <Panel>
                <PanelTitle>各区课程落实达标率</PanelTitle>
                <div style={{maxHeight: 236, overflowY: "auto", paddingRight: 2}}>
                  {RANKED_BY_RATE.map((d, i) => (
                    <RateBar key={d.name} rank={i + 1} name={d.name} rate={d.value} delay={`${i * 0.05}s`} />
                  ))}
                </div>
              </Panel>
              <Panel>
                <PanelTitle>学校类型构成</PanelTitle>
                <ReactECharts
                  option={this.getSchoolTypePieOption()}
                  style={{height: 188}}
                  theme="dark"
                  opts={{renderer: "canvas"}}
                />
              </Panel>
            </div>

            {/* Center: map */}
            <div style={{flex: 1, minWidth: 0}}>
              <Panel style={{padding: 8}} glow>
                <PanelTitle>北京市各区课程落实达标率分布</PanelTitle>
                {loadError && (
                  <div style={{color: COLORS.text, textAlign: "center", padding: "60px 0", fontSize: 13}}>
                    地图数据加载失败，请检查网络连接后刷新。
                  </div>
                )}
                {!loadError && !geoLoaded && (
                  <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 440}}>
                    <Spin size="large" />
                  </div>
                )}
                {geoLoaded && (
                  <ReactECharts
                    ref={this.chartRef}
                    option={this.getMapOption()}
                    style={{height: 460, width: "100%"}}
                    theme="dark"
                    opts={{renderer: "canvas"}}
                  />
                )}
              </Panel>
            </div>

            {/* Right column */}
            <div style={{width: 224, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12}}>
              <Panel>
                <PanelTitle>实验教学主要困难</PanelTitle>
                <ReactECharts
                  option={this.getDifficultiesOption()}
                  style={{height: 162}}
                  theme="dark"
                  opts={{renderer: "canvas"}}
                />
              </Panel>
              <Panel>
                <PanelTitle>实验器材更新状况</PanelTitle>
                <ReactECharts
                  option={this.getEquipUpdateOption()}
                  style={{height: 188}}
                  theme="dark"
                  opts={{renderer: "canvas"}}
                />
              </Panel>
            </div>

          </div>

          {/* ── Bottom row: 3 equal panels ── */}
          <div style={{display: "flex", gap: 14, marginTop: 14}}>
            <Panel style={{flex: 1, minWidth: 0}}>
              <PanelTitle>实验教学类型完成率（学段对比）</PanelTitle>
              <ReactECharts
                option={this.getTeachingRadarOption()}
                style={{height: 230}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>
            <Panel style={{flex: 1, minWidth: 0}}>
              <PanelTitle>科技活动参与率（蓝=请进来 绿=走出去）</PanelTitle>
              <ReactECharts
                option={this.getActivitiesOption()}
                style={{height: 230}}
                theme="dark"
                opts={{renderer: "canvas"}}
              />
            </Panel>
            <Panel style={{flex: 1, minWidth: 0}}>
              <PanelTitle>科学教育经费投入结构（万元）</PanelTitle>
              <ReactECharts
                option={this.getFundingOption()}
                style={{height: 230}}
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

export default DashboardCityPage;
