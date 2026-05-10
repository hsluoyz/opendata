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

const DISTRICT_DATA = [
  {name: "东城区", value: 45, students: 28400, teachers: 2100, center: [116.418, 39.917]},
  {name: "西城区", value: 52, students: 31200, teachers: 2380, center: [116.366, 39.912]},
  {name: "朝阳区", value: 168, students: 98600, teachers: 7200, center: [116.586, 39.921]},
  {name: "丰台区", value: 95, students: 56800, teachers: 4100, center: [116.287, 39.858]},
  {name: "石景山区", value: 38, students: 22100, teachers: 1680, center: [116.222, 39.914]},
  {name: "海淀区", value: 142, students: 84500, teachers: 6300, center: [116.298, 39.959]},
  {name: "门头沟区", value: 22, students: 13200, teachers: 980, center: [116.101, 39.940]},
  {name: "房山区", value: 67, students: 40100, teachers: 2980, center: [116.143, 39.748]},
  {name: "通州区", value: 88, students: 52400, teachers: 3900, center: [116.757, 39.909]},
  {name: "顺义区", value: 76, students: 45200, teachers: 3360, center: [116.655, 40.130]},
  {name: "昌平区", value: 83, students: 49600, teachers: 3700, center: [116.231, 40.221]},
  {name: "大兴区", value: 91, students: 54300, teachers: 4020, center: [116.341, 39.729]},
  {name: "怀柔区", value: 34, students: 20200, teachers: 1520, center: [116.632, 40.316]},
  {name: "平谷区", value: 29, students: 17400, teachers: 1300, center: [117.121, 40.141]},
  {name: "密云区", value: 31, students: 18600, teachers: 1390, center: [116.843, 40.477]},
  {name: "延庆区", value: 19, students: 11400, teachers: 850, center: [115.975, 40.465]},
];

const TOTAL_SCHOOLS = DISTRICT_DATA.reduce((s, d) => s + d.value, 0);
const TOTAL_STUDENTS = DISTRICT_DATA.reduce((s, d) => s + d.students, 0);
const TOTAL_TEACHERS = DISTRICT_DATA.reduce((s, d) => s + d.teachers, 0);

const RANKED = [...DISTRICT_DATA].sort((a, b) => b.value - a.value);

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
  mapHighlight: "#0e6ea6",
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
  @keyframes db-ripple {
    0%   { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes db-grid-move {
    0%   { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }
`;

function Corner({pos}) {
  const size = 16;
  const thickness = 2;
  const color = COLORS.accent;
  const style = {
    position: "absolute",
    width: size,
    height: size,
    animation: "db-corner-spin 3s ease-in-out infinite",
    ...pos,
  };
  const h = {position: "absolute", background: color, height: thickness, width: "100%"};
  const v = {position: "absolute", background: color, width: thickness, height: "100%"};
  const isRight = pos.right !== undefined;
  const isBottom = pos.bottom !== undefined;
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
      fontSize: 12,
      fontWeight: 700,
      color: COLORS.accent,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      marginBottom: 14,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      <span style={{display: "inline-block", width: 3, height: 12, background: COLORS.accent, borderRadius: 2}} />
      {children}
    </div>
  );
}

function RankBar({rank, name, value, max, delay}) {
  const pct = Math.round((value / max) * 100);
  const rankColor = rank === 1 ? "#ffd166" : rank === 2 ? "#c0c0c0" : rank === 3 ? "#cd7f32" : COLORS.accent;
  return (
    <div style={{marginBottom: 9, animation: "db-rank-slide 0.5s ease both", animationDelay: delay}}>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 12}}>
        <span style={{color: COLORS.textBright}}>
          <span style={{color: rankColor, fontWeight: 700, minWidth: 18, display: "inline-block"}}>{rank}</span>
          {name}
        </span>
        <span style={{color: COLORS.accent, fontWeight: 600}}>{value}</span>
      </div>
      <div style={{height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden"}}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${rankColor}88, ${rankColor})`,
          borderRadius: 4,
          transition: "width 1s ease",
          boxShadow: `0 0 6px ${rankColor}88`,
        }} />
      </div>
    </div>
  );
}

function Clock({time}) {
  const pad = n => String(n).padStart(2, "0");
  const h = pad(time.getHours());
  const m = pad(time.getMinutes());
  const s = pad(time.getSeconds());
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

class DashboardCityPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geoLoaded: false,
      loadError: false,
      time: new Date(),
      isFullscreen: false,
    };
    this.chartRef = React.createRef();
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
    fetch("https://geo.datav.aliyun.com/areas_v3/bound/110000_full.json")
      .then(r => r.json())
      .then(geo => {
        echarts.registerMap("beijing_districts", geo);
        this.setState({geoLoaded: true});
      })
      .catch(() => this.setState({loadError: true}));
  }

  componentWillUnmount() {
    clearInterval(this.clockTimer);
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
  }

  getMapOption() {
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(3, 20, 50, 0.92)",
        borderColor: COLORS.borderBright,
        borderWidth: 1,
        padding: [10, 14],
        textStyle: {color: COLORS.textBright, fontSize: 13},
        formatter: params => {
          const district = DISTRICT_DATA.find(d => d.name === params.name);
          if (!district) {return params.name || "";}
          return [
            `<div style="font-weight:700;font-size:14px;color:${COLORS.accent};margin-bottom:6px">${district.name}</div>`,
            `<div style="color:${COLORS.text}">学校数量：<span style="color:#fff;font-weight:600">${district.value} 所</span></div>`,
            `<div style="color:${COLORS.text}">在校学生：<span style="color:#fff;font-weight:600">${district.students.toLocaleString()} 人</span></div>`,
            `<div style="color:${COLORS.text}">教职人员：<span style="color:#fff;font-weight:600">${district.teachers.toLocaleString()} 人</span></div>`,
          ].join("");
        },
      },
      visualMap: {
        min: 0,
        max: 180,
        show: false,
        inRange: {
          color: ["#0a2540", "#0d3566", "#0f4a8a", "#1565c0", "#1976d2"],
        },
      },
      geo: {
        map: "beijing_districts",
        roam: true,
        zoom: 1.15,
        center: [116.4, 40.1],
        label: {
          show: true,
          color: "#8ec5de",
          fontSize: 10,
          fontWeight: "500",
        },
        itemStyle: {
          areaColor: COLORS.mapArea,
          borderColor: COLORS.mapBorder,
          borderWidth: 1.2,
          shadowColor: "rgba(0, 100, 200, 0.4)",
          shadowBlur: 8,
        },
        emphasis: {
          label: {show: true, color: "#ffffff", fontSize: 12, fontWeight: "bold"},
          itemStyle: {
            areaColor: "#1565c0",
            borderColor: COLORS.accent,
            borderWidth: 2,
            shadowColor: COLORS.mapHighlightGlow,
            shadowBlur: 20,
          },
        },
        select: {disabled: true},
      },
      series: [
        {
          name: "北京各区",
          type: "map",
          map: "beijing_districts",
          geoIndex: 0,
          data: DISTRICT_DATA,
        },
        {
          name: "学校分布",
          type: "effectScatter",
          coordinateSystem: "geo",
          data: DISTRICT_DATA.map(d => ({name: d.name, value: [...d.center, d.value]})),
          symbolSize: d => Math.max(4, Math.sqrt(d[2]) * 1.8),
          showEffectOn: "render",
          rippleEffect: {
            brushType: "stroke",
            scale: 3.5,
            period: 3.5,
            color: COLORS.accent,
          },
          itemStyle: {
            color: COLORS.accent,
            shadowBlur: 12,
            shadowColor: COLORS.accent,
          },
          zlevel: 2,
        },
      ],
    };
  }

  render() {
    const {geoLoaded, loadError, time, isFullscreen} = this.state;

    return (
      <div ref={this.containerRef} style={{
        background: COLORS.bg,
        minHeight: isFullscreen ? "100vh" : "calc(100vh - 100px)",
        padding: "18px 20px 20px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
      }}>
        <style>{ANIMATION_STYLES}</style>

        {/* animated grid background */}
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
                北京市教育数据大屏
              </div>
              <div style={{fontSize: 11, color: COLORS.text, marginTop: 5, letterSpacing: "0.1em"}}>
                BEIJING EDUCATION DATA PLATFORM
              </div>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 20}}>
              <div style={{textAlign: "center"}}>
                <div style={{fontSize: 11, color: COLORS.text, letterSpacing: "0.08em"}}>数据更新</div>
                <div style={{fontSize: 12, color: COLORS.accent2, fontWeight: 600, marginTop: 2}}>实时同步</div>
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
            {[
              {label: "学校总数", value: TOTAL_SCHOOLS, unit: "所", color: COLORS.accent},
              {label: "在校学生", value: TOTAL_STUDENTS, unit: "人", color: COLORS.accent2},
              {label: "教职人员", value: TOTAL_TEACHERS, unit: "人", color: COLORS.accent3},
              {label: "覆盖区域", value: 16, unit: "区", color: "#b388ff"},
              {label: "数据采集率", value: "100", unit: "%", color: "#ff6e6e"},
            ].map((kpi, i) => (
              <div key={kpi.label} style={{
                flex: 1,
                background: COLORS.panelBg,
                border: `1px solid ${kpi.color}33`,
                borderRadius: 8,
                padding: "12px 16px",
                position: "relative",
                overflow: "hidden",
                animation: "db-count-in 0.5s ease both",
                animationDelay: `${i * 0.1}s`,
              }}>
                <div style={{position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${kpi.color}88, transparent)`}} />
                <div style={{fontSize: 11, color: COLORS.text, letterSpacing: "0.06em"}}>{kpi.label}</div>
                <div style={{display: "flex", alignItems: "baseline", gap: 3, marginTop: 4}}>
                  <span style={{fontSize: 24, fontWeight: 700, color: kpi.color, fontVariantNumeric: "tabular-nums"}}>
                    {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
                  </span>
                  <span style={{fontSize: 11, color: COLORS.text}}>{kpi.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main 3-column layout ── */}
          <div style={{display: "flex", gap: 14, alignItems: "flex-start"}}>

            {/* Left panel */}
            <div style={{width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12}}>
              <Panel>
                <PanelTitle>城区分布 TOP 5</PanelTitle>
                {RANKED.slice(0, 5).map((d, i) => (
                  <RankBar key={d.name} rank={i + 1} name={d.name} value={d.value} max={RANKED[0].value} delay={`${i * 0.08}s`} />
                ))}
              </Panel>
              <Panel>
                <PanelTitle>学生规模 TOP 5</PanelTitle>
                {[...DISTRICT_DATA].sort((a, b) => b.students - a.students).slice(0, 5).map((d, i) => (
                  <RankBar
                    key={d.name} rank={i + 1} name={d.name}
                    value={(d.students / 1000).toFixed(1) + "k"}
                    max={1} delay={`${i * 0.08}s`}
                  />
                ))}
              </Panel>
            </div>

            {/* Center: map */}
            <div style={{flex: 1, minWidth: 0}}>
              <Panel style={{padding: 8}} glow>
                <PanelTitle>北京市各区地图 — 学校分布</PanelTitle>
                {loadError && (
                  <div style={{color: COLORS.text, textAlign: "center", padding: "60px 0", fontSize: 13}}>
                    地图数据加载失败，请检查网络连接后刷新。
                  </div>
                )}
                {!loadError && !geoLoaded && (
                  <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 420}}>
                    <Spin size="large" />
                  </div>
                )}
                {geoLoaded && (
                  <ReactECharts
                    ref={this.chartRef}
                    option={this.getMapOption()}
                    style={{height: 440, width: "100%"}}
                    theme="dark"
                    opts={{renderer: "canvas"}}
                  />
                )}
              </Panel>
            </div>

            {/* Right panel */}
            <div style={{width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12}}>
              <Panel>
                <PanelTitle>区域详情</PanelTitle>
                <div style={{maxHeight: 200, overflowY: "auto", paddingRight: 2}}>
                  {RANKED.map((d, i) => (
                    <div key={d.name} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      borderBottom: i < RANKED.length - 1 ? `1px solid ${COLORS.border}` : "none",
                      animation: "db-rank-slide 0.4s ease both",
                      animationDelay: `${i * 0.04}s`,
                    }}>
                      <span style={{fontSize: 12, color: COLORS.text}}>{d.name}</span>
                      <div style={{textAlign: "right"}}>
                        <div style={{fontSize: 12, color: COLORS.accent, fontWeight: 600}}>{d.value} 所</div>
                        <div style={{fontSize: 10, color: "#607080"}}>{(d.students / 1000).toFixed(1)}k 生</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel>
                <PanelTitle>师生比例</PanelTitle>
                <ReactECharts
                  option={{
                    backgroundColor: "transparent",
                    grid: {top: 8, bottom: 20, left: 40, right: 8},
                    xAxis: {
                      type: "value",
                      axisLabel: {color: "#607080", fontSize: 9},
                      splitLine: {lineStyle: {color: "rgba(255,255,255,0.05)"}},
                    },
                    yAxis: {
                      type: "category",
                      data: RANKED.slice(0, 6).map(d => d.name).reverse(),
                      axisLabel: {color: COLORS.text, fontSize: 10},
                      axisTick: {show: false},
                      axisLine: {lineStyle: {color: COLORS.border}},
                    },
                    series: [{
                      type: "bar",
                      data: RANKED.slice(0, 6).map(d => Math.round(d.students / d.teachers)).reverse(),
                      barMaxWidth: 14,
                      itemStyle: {
                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                          {offset: 0, color: COLORS.accent},
                          {offset: 1, color: "#005580"},
                        ]),
                        borderRadius: [0, 4, 4, 0],
                      },
                      label: {show: true, position: "right", color: COLORS.text, fontSize: 9, formatter: "{c}:1"},
                    }],
                    tooltip: {
                      trigger: "axis",
                      backgroundColor: "rgba(3,20,50,0.9)",
                      borderColor: COLORS.borderBright,
                      textStyle: {color: COLORS.textBright, fontSize: 12},
                      formatter: p => `${p[0].name}<br/>师生比 1:${p[0].value}`,
                    },
                  }}
                  style={{height: 180}}
                  theme="dark"
                />
              </Panel>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DashboardCityPage;
