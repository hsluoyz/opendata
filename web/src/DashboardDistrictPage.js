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
import {Select, Spin} from "antd";

// ── District master data ────────────────────────────────────────────────────

// center: [lng, lat] used to focus the map on the district
// zoom: echarts geo zoom level — smaller districts get higher zoom
// radius: degree-radius for generating scatter school points
const DISTRICTS = [
  {name: "海淀区", code: "110108", schools: 142, students: 84500, teachers: 6300, classes: 3820, center: [116.298, 39.959], zoom: 5.5, radius: 0.10},
  {name: "朝阳区", code: "110105", schools: 168, students: 98600, teachers: 7200, classes: 4460, center: [116.586, 39.921], zoom: 4.8, radius: 0.13},
  {name: "西城区", code: "110102", schools: 52, students: 31200, teachers: 2380, classes: 1420, center: [116.366, 39.912], zoom: 8, radius: 0.04},
  {name: "东城区", code: "110101", schools: 45, students: 28400, teachers: 2100, classes: 1280, center: [116.418, 39.917], zoom: 8, radius: 0.04},
  {name: "丰台区", code: "110106", schools: 95, students: 56800, teachers: 4100, classes: 2560, center: [116.287, 39.858], zoom: 5.5, radius: 0.10},
  {name: "石景山区", code: "110107", schools: 38, students: 22100, teachers: 1680, classes: 990, center: [116.222, 39.914], zoom: 7, radius: 0.06},
  {name: "门头沟区", code: "110109", schools: 22, students: 13200, teachers: 980, classes: 590, center: [116.101, 39.940], zoom: 4, radius: 0.20},
  {name: "房山区", code: "110111", schools: 67, students: 40100, teachers: 2980, classes: 1800, center: [116.143, 39.748], zoom: 3.8, radius: 0.22},
  {name: "通州区", code: "110112", schools: 88, students: 52400, teachers: 3900, classes: 2360, center: [116.757, 39.909], zoom: 5, radius: 0.12},
  {name: "顺义区", code: "110113", schools: 76, students: 45200, teachers: 3360, classes: 2040, center: [116.655, 40.130], zoom: 4.8, radius: 0.13},
  {name: "昌平区", code: "110114", schools: 83, students: 49600, teachers: 3700, classes: 2230, center: [116.231, 40.221], zoom: 5, radius: 0.12},
  {name: "大兴区", code: "110115", schools: 91, students: 54300, teachers: 4020, classes: 2450, center: [116.341, 39.729], zoom: 5, radius: 0.13},
  {name: "怀柔区", code: "110116", schools: 34, students: 20200, teachers: 1520, classes: 910, center: [116.632, 40.316], zoom: 3.8, radius: 0.22},
  {name: "平谷区", code: "110117", schools: 29, students: 17400, teachers: 1300, classes: 780, center: [117.121, 40.141], zoom: 5, radius: 0.14},
  {name: "密云区", code: "110118", schools: 31, students: 18600, teachers: 1390, classes: 840, center: [116.843, 40.477], zoom: 4, radius: 0.20},
  {name: "延庆区", code: "110119", schools: 19, students: 11400, teachers: 850, classes: 510, center: [115.975, 40.465], zoom: 4, radius: 0.22},
];

const SCHOOL_TYPES = [
  {name: "幼儿园", key: "kindergarten", baseRatio: 0.28, color: "#ff6e9c"},
  {name: "小学", key: "primary", baseRatio: 0.32, color: "#00c3ff"},
  {name: "初中", key: "middle", baseRatio: 0.18, color: "#00ffb8"},
  {name: "高中", key: "high", baseRatio: 0.12, color: "#ffd166"},
  {name: "职业学校", key: "vocational", baseRatio: 0.06, color: "#b388ff"},
  {name: "特殊学校", key: "special", baseRatio: 0.04, color: "#ff8a65"},
];

// Deterministic pseudo-random using string hash — gives stable values per name
function hashVal(str, min, max) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) & 0x7fffffff;
  }
  return min + (h % (max - min + 1));
}

function getSchoolTypeDist(district) {
  const total = district.schools;
  const raw = SCHOOL_TYPES.map(t => ({
    ...t,
    value: Math.round(total * t.baseRatio * (0.8 + hashVal(district.name + t.key, 0, 40) / 100)),
  }));
  // normalise so sum == total
  const sum = raw.reduce((s, t) => s + t.value, 0);
  const scale = total / sum;
  return raw.map(t => ({...t, value: Math.round(t.value * scale)}));
}

// Generate deterministic scatter points within the district's approximate area
function getScatterPoints(district) {
  const [lng, lat] = district.center;
  const r = district.radius;
  const count = Math.min(50, Math.max(12, district.schools));
  return Array.from({length: count}, (_, i) => {
    const angle = hashVal(district.name + "a" + i, 0, 628) / 100;
    const d = hashVal(district.name + "d" + i, 15, 100) / 100 * r;
    return {
      name: `${district.name}学校${i + 1}`,
      value: [lng + d * Math.cos(angle), lat + d * Math.sin(angle)],
    };
  });
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
`;

// ── Small reusable components ───────────────────────────────────────────────

function Corner({pos}) {
  const color = C.accent;
  return (
    <div style={{position: "absolute", width: 14, height: 14, animation: "dd-corner 3s ease-in-out infinite", ...pos}}>
      <div style={{position: "absolute", background: color, height: 2, width: "100%", top: pos.bottom !== undefined ? undefined : 0, bottom: pos.bottom !== undefined ? 0 : undefined}} />
      <div style={{position: "absolute", background: color, width: 2, height: "100%", left: pos.right !== undefined ? undefined : 0, right: pos.right !== undefined ? 0 : undefined}} />
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
    <div style={{fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 7}}>
      <span style={{display: "inline-block", width: 3, height: 11, background: C.accent, borderRadius: 2}} />
      {children}
    </div>
  );
}

function KpiStrip({district}) {
  const items = [
    {label: "学校总数", value: district.schools, unit: "所", color: C.accent},
    {label: "在校学生", value: district.students.toLocaleString(), unit: "人", color: C.accent2},
    {label: "教职人员", value: district.teachers.toLocaleString(), unit: "人", color: C.accent3},
    {label: "班级数量", value: district.classes.toLocaleString(), unit: "个", color: "#b388ff"},
    {label: "师生比", value: `1:${Math.round(district.students / district.teachers)}`, unit: "", color: "#ff8a65"},
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
            {kpi.unit && <span style={{fontSize: 11, color: C.text}}>{kpi.unit}</span>}
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

// ── Main page ───────────────────────────────────────────────────────────────

class DashboardDistrictPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDistrict: DISTRICTS.find(d => d.name === "海淀区"),
      geoLoaded: false,
      geoLoading: false,
      loadError: false,
      time: new Date(),
      isFullscreen: false,
    };
    this.containerRef = React.createRef();
    this.cityGeo = null;
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
    this.loadCityGeo();
  }

  componentWillUnmount() {
    clearInterval(this.clockTimer);
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
  }

  loadCityGeo() {
    if (echarts.getMap("beijing_city")) {
      this.setState({geoLoaded: true, geoLoading: false});
      return;
    }
    this.setState({geoLoading: true, loadError: false});
    fetch("https://geo.datav.aliyun.com/areas_v3/bound/110000_full.json")
      .then(r => r.json())
      .then(geo => {
        this.cityGeo = geo;
        echarts.registerMap("beijing_city", geo);
        this.setState({geoLoaded: true, geoLoading: false});
      })
      .catch(() => this.setState({geoLoading: false, loadError: true}));
  }

  onDistrictChange = name => {
    const district = DISTRICTS.find(d => d.name === name);
    this.setState({selectedDistrict: district});
  };

  getMapOption() {
    const {selectedDistrict} = this.state;
    const scatter = getScatterPoints(selectedDistrict);
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(3, 20, 50, 0.92)",
        borderColor: C.borderBright,
        borderWidth: 1,
        padding: [10, 14],
        textStyle: {color: C.textBright, fontSize: 13},
        formatter: params => {
          const d = DISTRICTS.find(x => x.name === params.name);
          if (!d) {return params.name || "";}
          const isSelected = d.name === selectedDistrict.name;
          return [
            `<div style="font-weight:700;font-size:14px;color:${isSelected ? C.accent : C.text};margin-bottom:6px">${d.name}${isSelected ? " ★" : ""}</div>`,
            `<div style="color:${C.text}">学校数量：<span style="color:#fff;font-weight:600">${d.schools} 所</span></div>`,
            `<div style="color:${C.text}">在校学生：<span style="color:#fff;font-weight:600">${d.students.toLocaleString()} 人</span></div>`,
            `<div style="color:${C.text}">教职人员：<span style="color:#fff;font-weight:600">${d.teachers.toLocaleString()} 人</span></div>`,
          ].join("");
        },
      },
      geo: {
        map: "beijing_city",
        roam: true,
        center: selectedDistrict.center,
        zoom: selectedDistrict.zoom,
        label: {
          show: true,
          color: "#5a8aaa",
          fontSize: 9,
          fontWeight: "500",
          formatter: params => params.name === selectedDistrict.name ? `{sel|${params.name}}` : params.name,
          rich: {sel: {color: "#fff", fontWeight: "bold", fontSize: 11}},
        },
        itemStyle: {areaColor: "#061830", borderColor: "#0d2a4a", borderWidth: 0.8},
        emphasis: {
          label: {show: true, color: "#fff", fontSize: 11, fontWeight: "bold"},
          itemStyle: {areaColor: "#0a3560", borderColor: C.accent, borderWidth: 1.5, shadowColor: C.borderBright, shadowBlur: 12},
        },
        select: {disabled: true},
        regions: [{
          name: selectedDistrict.name,
          itemStyle: {areaColor: "#1565c0", borderColor: C.accent, borderWidth: 2, shadowColor: C.mapHighlightGlow || "rgba(0,195,255,0.7)", shadowBlur: 28},
          label: {show: true, color: "#fff", fontSize: 12, fontWeight: "bold"},
        }],
      },
      series: [
        {
          name: "各区",
          type: "map",
          map: "beijing_city",
          geoIndex: 0,
          data: DISTRICTS.map(d => ({name: d.name, value: d.schools})),
          silent: true,
        },
        {
          name: "学校散点",
          type: "effectScatter",
          coordinateSystem: "geo",
          data: scatter,
          symbolSize: 5,
          showEffectOn: "render",
          rippleEffect: {brushType: "stroke", scale: 3, period: 3, color: C.accent},
          itemStyle: {color: C.accent, shadowBlur: 8, shadowColor: C.accent},
          zlevel: 2,
          tooltip: {show: false},
        },
      ],
    };
  }

  getPieOption() {
    const dist = getSchoolTypeDist(this.state.selectedDistrict);
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(3,20,50,0.92)",
        borderColor: C.borderBright,
        borderWidth: 1,
        textStyle: {color: C.textBright, fontSize: 12},
        formatter: p => `${p.name}：${p.value} 所 (${p.percent}%)`,
      },
      legend: {
        bottom: 0,
        left: "center",
        textStyle: {color: C.text, fontSize: 10},
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [{
        type: "pie",
        radius: ["38%", "62%"],
        center: ["50%", "44%"],
        data: dist.map(t => ({name: t.name, value: t.value, itemStyle: {color: t.color, shadowBlur: 10, shadowColor: t.color + "88"}})),
        label: {show: false},
        emphasis: {
          label: {show: true, color: "#fff", fontSize: 13, fontWeight: "bold"},
          itemStyle: {shadowBlur: 20},
        },
      }],
    };
  }

  getRankingOption() {
    const selected = this.state.selectedDistrict.name;
    const sorted = [...DISTRICTS].sort((a, b) => b.schools - a.schools);
    return {
      backgroundColor: "transparent",
      grid: {top: 6, bottom: 16, left: 52, right: 38},
      xAxis: {
        type: "value",
        axisLabel: {color: "#607080", fontSize: 8},
        splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
      },
      yAxis: {
        type: "category",
        data: sorted.map(d => d.name).reverse(),
        axisLabel: {
          color: params => params === selected ? C.accent : C.text,
          fontSize: 9,
          fontWeight: params => params === selected ? "bold" : "normal",
        },
        axisTick: {show: false},
        axisLine: {lineStyle: {color: C.border}},
      },
      series: [{
        type: "bar",
        barMaxWidth: 11,
        data: sorted.map(d => ({
          value: d.schools,
          itemStyle: {
            color: d.name === selected
              ? new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: C.accent}, {offset: 1, color: "#004466"}])
              : new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: "#1565c088"}, {offset: 1, color: "#0a254066"}]),
            borderRadius: [0, 3, 3, 0],
            shadowBlur: d.name === selected ? 10 : 0,
            shadowColor: d.name === selected ? C.accent : "transparent",
          },
        })).reverse(),
        label: {show: true, position: "right", color: C.text, fontSize: 8, formatter: "{c}"},
      }],
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(3,20,50,0.92)",
        borderColor: C.borderBright,
        textStyle: {color: C.textBright, fontSize: 11},
        formatter: p => `${p[0].name}：${p[0].value} 所学校`,
      },
    };
  }

  render() {
    const {selectedDistrict, geoLoaded, geoLoading, loadError, time, isFullscreen} = this.state;
    const typeDist = getSchoolTypeDist(selectedDistrict);

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
                  {selectedDistrict.name}教育数据大屏
                </div>
                <div style={{fontSize: 11, color: C.text, marginTop: 4, letterSpacing: "0.08em"}}>
                  DISTRICT EDUCATION DATA PLATFORM
                </div>
              </div>
              <Select
                value={selectedDistrict.name}
                onChange={this.onDistrictChange}
                style={{width: 130}}
                popupMatchSelectWidth={false}
                variant="borderless"
                styles={{
                  popup: {root: {background: "#061c3a", border: `1px solid ${C.border}`}},
                }}
                className="district-select"
                options={DISTRICTS.map(d => ({value: d.name, label: d.name}))}
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
                <div style={{fontSize: 11, color: C.text, letterSpacing: "0.06em"}}>数据更新</div>
                <div style={{fontSize: 12, color: C.accent2, fontWeight: 600, marginTop: 2}}>实时同步</div>
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
          <KpiStrip district={selectedDistrict} />

          {/* ── Main layout ── */}
          <div style={{display: "flex", gap: 13, alignItems: "flex-start"}}>

            {/* Left */}
            <div style={{width: 210, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12}}>
              <Panel>
                <PanelTitle>学校类型分布</PanelTitle>
                <ReactECharts
                  option={this.getPieOption()}
                  style={{height: 220}}
                  theme="dark"
                  opts={{renderer: "canvas"}}
                />
              </Panel>
              <Panel>
                <PanelTitle>各学段在校生</PanelTitle>
                <ReactECharts
                  option={{
                    backgroundColor: "transparent",
                    grid: {top: 6, bottom: 18, left: 44, right: 10},
                    xAxis: {
                      type: "value",
                      axisLabel: {color: "#607080", fontSize: 8, formatter: v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v},
                      splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
                    },
                    yAxis: {
                      type: "category",
                      data: ["幼儿园", "小学", "初中", "高中", "职业"],
                      axisLabel: {color: C.text, fontSize: 9},
                      axisTick: {show: false},
                      axisLine: {lineStyle: {color: C.border}},
                    },
                    series: [{
                      type: "bar",
                      barMaxWidth: 12,
                      data: getSchoolTypeDist(selectedDistrict).slice(0, 5).map((t, i) => ({
                        value: Math.round(t.value * selectedDistrict.students / selectedDistrict.schools * (0.85 + i * 0.04)),
                        itemStyle: {color: t.color, borderRadius: [0, 4, 4, 0]},
                      })),
                      label: {show: false},
                    }],
                    tooltip: {
                      trigger: "axis",
                      backgroundColor: "rgba(3,20,50,0.92)",
                      borderColor: C.borderBright,
                      textStyle: {color: C.textBright, fontSize: 11},
                    },
                  }}
                  style={{height: 150}}
                  theme="dark"
                />
              </Panel>
            </div>

            {/* Center map */}
            <div style={{flex: 1, minWidth: 0}}>
              <Panel style={{padding: 10}} glow>
                <PanelTitle>{selectedDistrict.name} — 学校分布（北京市定位视图）</PanelTitle>
                {loadError && (
                  <div style={{color: C.text, textAlign: "center", padding: "60px 0", fontSize: 13}}>
                    地图数据加载失败，请检查网络连接后刷新。
                  </div>
                )}
                {(geoLoading || (!geoLoaded && !loadError)) && (
                  <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 460}}>
                    <Spin size="large" />
                  </div>
                )}
                {geoLoaded && !loadError && (
                  <ReactECharts
                    option={this.getMapOption()}
                    style={{height: 460, width: "100%"}}
                    theme="dark"
                    opts={{renderer: "canvas"}}
                  />
                )}
              </Panel>
            </div>

            {/* Right */}
            <div style={{width: 210, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12}}>
              <Panel>
                <PanelTitle>全市各区学校排行</PanelTitle>
                {geoLoaded
                  ? <ReactECharts option={this.getRankingOption()} style={{height: 260}} theme="dark" />
                  : <div style={{height: 260, display: "flex", alignItems: "center", justifyContent: "center"}}><Spin /></div>
                }
              </Panel>
              <Panel>
                <PanelTitle>学校类型详情</PanelTitle>
                <div style={{maxHeight: 200, overflowY: "auto"}}>
                  {typeDist.map((t, i) => (
                    <div key={t.name} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "6px 0",
                      borderBottom: i < typeDist.length - 1 ? `1px solid ${C.border}` : "none",
                      animation: "dd-in 0.4s ease both",
                      animationDelay: `${i * 0.06}s`,
                    }}>
                      <div style={{display: "flex", alignItems: "center", gap: 6}}>
                        <span style={{display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: t.color, boxShadow: `0 0 6px ${t.color}`}} />
                        <span style={{fontSize: 12, color: C.text}}>{t.name}</span>
                      </div>
                      <div style={{textAlign: "right"}}>
                        <span style={{fontSize: 13, color: t.color, fontWeight: 600}}>{t.value}</span>
                        <span style={{fontSize: 10, color: "#607080", marginLeft: 2}}>所</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DashboardDistrictPage;
