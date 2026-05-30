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
import dashboardData from "./DashboardData.json";

const DISTRICTS_DATA = dashboardData["区县数据"];
const CITY = dashboardData["市级数据"];

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  primary: "#1a3a6b",
  accent: "#2563b0",
  accentLight: "#dbeafe",
  green: "#16a34a",
  greenLight: "#dcfce7",
  orange: "#ea580c",
  orangeLight: "#ffedd5",
  red: "#dc2626",
  redLight: "#fee2e2",
  gray: "#64748b",
  grayLight: "#f1f5f9",
  border: "#cbd5e1",
  text: "#1e293b",
  muted: "#475569",
};

// Chart series colors
const SERIES_COLORS = ["#2563b0", "#16a34a", "#ea580c", "#7c3aed", "#db2777", "#0891b2"];

// ── Formatters ────────────────────────────────────────────────────────────────
function f(v, dec = 2) {
  if (v === null) {return "—";}
  return Number(v).toFixed(dec);
}
function pct(v, dec = 2) {
  if (v === null) {return "—";}
  return `${Number(v).toFixed(dec)}%`;
}
function diffPp(a, b) {
  const d = a - b;
  return `${d >= 0 ? "+" : ""}${d.toFixed(2)}pp`;
}

// ── DiffTag ───────────────────────────────────────────────────────────────────
function DiffTag({a, b, reverse = false}) {
  const d = a - b;
  const good = reverse ? d < 0 : d >= 0;
  return (
    <span style={{
      display: "inline-block", fontSize: 11, padding: "1px 6px",
      borderRadius: 4, marginLeft: 6, fontWeight: 600,
      color: good ? C.green : C.red,
      background: good ? C.greenLight : C.redLight,
    }}>
      {d >= 0 ? "+" : ""}{d.toFixed(2)}pp
    </span>
  );
}

// ── Layout atoms ──────────────────────────────────────────────────────────────
function H1({num, title}) {
  return (
    <div style={{
      fontSize: 17, fontWeight: 800, color: C.primary,
      borderBottom: `3px solid ${C.accent}`,
      paddingBottom: 6, marginBottom: 20, letterSpacing: "0.04em",
    }}>
      {num && <span style={{color: C.accent, marginRight: 8}}>{num}</span>}
      {title}
    </div>
  );
}

function H2({title}) {
  return (
    <div style={{
      fontSize: 14, fontWeight: 700, color: C.primary,
      borderLeft: `4px solid ${C.accent}`,
      paddingLeft: 10, marginBottom: 14,
    }}>
      {title}
    </div>
  );
}

function H3({num, title}) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 700, color: C.text,
      marginBottom: 10, display: "flex", alignItems: "center", gap: 6,
    }}>
      <span style={{
        display: "inline-block", width: 20, height: 20, flexShrink: 0,
        background: C.accent, color: "#fff", borderRadius: "50%",
        fontSize: 11, textAlign: "center", lineHeight: "20px",
      }}>{num}</span>
      {title}
    </div>
  );
}

function Section({num, title, children}) {
  return (
    <div style={{marginBottom: 36}}>
      <H1 num={num} title={title} />
      {children}
    </div>
  );
}

function Sub({title, children}) {
  return (
    <div style={{marginBottom: 24}}>
      <H2 title={title} />
      {children}
    </div>
  );
}

function SubSub({num, title, children}) {
  return (
    <div style={{marginBottom: 20}}>
      <H3 num={num} title={title} />
      <div style={{paddingLeft: 26}}>{children}</div>
    </div>
  );
}

function Para({children, style}) {
  return (
    <p style={{fontSize: 13, lineHeight: 1.9, color: C.text, marginBottom: 10, textIndent: "2em", ...style}}>
      {children}
    </p>
  );
}

function StatRow({children}) {
  return <div style={{display: "flex", gap: 12, marginBottom: 16}}>{children}</div>;
}

function Kpi({label, value, unit = "%", sub, color = C.accent}) {
  return (
    <div style={{
      flex: 1, background: "#fff", borderRadius: 6, padding: "12px 16px",
      border: `1px solid ${C.border}`, borderTop: `3px solid ${color}`, textAlign: "center",
    }}>
      <div style={{fontSize: 11, color: C.muted, marginBottom: 4}}>{label}</div>
      <div style={{fontSize: 24, fontWeight: 800, color, lineHeight: 1.1}}>
        {value}<span style={{fontSize: 13, fontWeight: 600, color: C.muted, marginLeft: 2}}>{unit}</span>
      </div>
      {sub && <div style={{fontSize: 10, color: C.muted, marginTop: 3}}>{sub}</div>}
    </div>
  );
}

function Table({headers, rows, caption}) {
  return (
    <div style={{marginBottom: 14, overflowX: "auto"}}>
      {caption && (
        <div style={{fontSize: 11, color: C.muted, marginBottom: 4, textAlign: "center"}}>{caption}</div>
      )}
      <table style={{width: "100%", borderCollapse: "collapse", fontSize: 12}}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                background: C.primary, color: "#fff", padding: "7px 10px",
                textAlign: i === 0 ? "left" : "center", fontWeight: 700, fontSize: 12,
                borderRight: i < headers.length - 1 ? "1px solid rgba(255,255,255,0.2)" : undefined,
                whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{background: ri % 2 === 0 ? "#fff" : C.grayLight}}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: "6px 10px",
                  textAlign: ci === 0 ? "left" : "center",
                  borderBottom: `1px solid ${C.border}`,
                  borderRight: ci < row.length - 1 ? `1px solid ${C.border}` : undefined,
                  color: C.text,
                  whiteSpace: ci === 0 ? "nowrap" : undefined,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartCard({title, children, style}) {
  return (
    <div style={{
      background: "#fff", border: `1px solid ${C.border}`,
      borderRadius: 6, padding: "12px 14px", marginBottom: 14, ...style,
    }}>
      {title && (
        <div style={{fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8, textAlign: "center"}}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ── ECharts option builders ───────────────────────────────────────────────────
function barOpt({categories, series, horizontal = false, maxVal = 100, grid}) {
  const baseGrid = {top: 28, bottom: 8, left: 6, right: 28, containLabel: true};
  const xAxis = horizontal
    ? {type: "value", max: maxVal, axisLabel: {formatter: v => `${v}%`, fontSize: 10, color: C.gray}, splitLine: {lineStyle: {color: "#e2e8f0"}}}
    : {type: "category", data: categories, axisLabel: {fontSize: 10, color: C.text}, axisTick: {show: false}, axisLine: {lineStyle: {color: C.border}}};
  const yAxis = horizontal
    ? {type: "category", data: categories, axisLabel: {fontSize: 10, color: C.text}, axisTick: {show: false}, axisLine: {lineStyle: {color: C.border}}}
    : {type: "value", max: maxVal, axisLabel: {formatter: v => `${v}%`, fontSize: 10, color: C.gray}, splitLine: {lineStyle: {color: "#e2e8f0"}}};
  return {
    backgroundColor: "transparent",
    grid: grid || baseGrid,
    legend: series.length > 1 ? {bottom: 0, textStyle: {fontSize: 10, color: C.text}, itemWidth: 10, itemHeight: 10} : undefined,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255,255,255,0.97)",
      borderColor: C.border,
      textStyle: {color: C.text, fontSize: 11},
      formatter: params => {
        const label = params[0]?.axisValue || "";
        return label + "<br/>" + params.map(p => `${p.marker}${p.seriesName}: <b>${(p.value || 0).toFixed(1)}%</b>`).join("<br/>");
      },
    },
    xAxis,
    yAxis,
    series: series.map((s, i) => ({
      name: s.name,
      type: "bar",
      barMaxWidth: 30,
      barGap: "15%",
      barCategoryGap: "35%",
      data: s.data.map(v => ({
        value: v,
        itemStyle: {color: s.color || SERIES_COLORS[i], borderRadius: horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]},
      })),
      label: {
        show: true,
        position: horizontal ? "right" : "top",
        formatter: p => `${(p.value || 0).toFixed(1)}%`,
        fontSize: 9, color: C.muted,
      },
    })),
  };
}

function pieOpt({data}) {
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255,255,255,0.97)",
      borderColor: C.border,
      textStyle: {color: C.text, fontSize: 11},
      formatter: p => `${p.name}: <b>${p.value.toFixed(1)}%</b>`,
    },
    legend: {
      orient: "vertical", right: 4, top: "center",
      textStyle: {color: C.text, fontSize: 10},
      itemWidth: 10, itemHeight: 10,
    },
    series: [{
      type: "pie",
      radius: ["38%", "62%"],
      center: ["40%", "50%"],
      data: data.map((d, i) => ({
        name: d.name, value: d.value,
        itemStyle: {color: d.color || SERIES_COLORS[i]},
      })),
      label: {
        show: true,
        formatter: p => p.value > 4 ? `${p.value.toFixed(0)}%` : "",
        color: "#fff", fontSize: 10, fontWeight: "bold",
      },
    }],
  };
}

// ── Sections ──────────────────────────────────────────────────────────────────

function SecCourseTeaching({d}) {
  const cityCourseRate = CITY["课程落实"]["达标率"];
  const courseRate = d["课程落实"]["达标率"];

  const freq = d["实验室使用频率"];
  const freqCats = ["几乎没有", "每学期1-2次", "每月1-2次", "每周1-2次", "每周3次及以上"];
  const freqClrs = [C.red, "#f97316", "#eab308", "#22c55e", C.accent];

  const diff_ = d["实验教学困难"];
  const cityDiff = CITY["实验教学困难"]["整体"];
  const diffKeys = ["实验场地和设备不足", "耗材经费有限", "教师实验教学能力有待提升", "课时不够", "安全隐患问题"];
  const diffShort = ["场地设备不足", "耗材经费有限", "教师能力提升", "课时不够", "安全隐患"];

  const cityCorseRate = CITY["校本课程建设"]["整体"]["建设比例"];
  const curRate = d["校本课程建设"]["建设比例"];
  const practRate = d["校本课程建设"]["动手实践类比例"];

  const cityAfterRate = CITY["课后服务"]["比例"];
  const afterRate = d["课后服务"]["比例"];

  return (
    <Sub title="（一）课程教学">
      <SubSub num="1" title="课程落实">
        <Para>
          2025年，{d["名称"]}共有<b>{pct(courseRate)}</b>的义务教育学校科学类课程课时数达到《义务教育课程方案和课程标准（2022年版）》的要求，
          {courseRate >= cityCourseRate
            ? <span>高于全市平均水平（{pct(cityCourseRate)}）<DiffTag a={courseRate} b={cityCourseRate} />。</span>
            : <span>低于全市平均水平（{pct(cityCourseRate)}）<DiffTag a={courseRate} b={cityCourseRate} />。</span>
          }
        </Para>
        <StatRow>
          <Kpi label="本区课程达标率" value={f(courseRate)} />
          <Kpi label="全市平均" value={f(cityCourseRate)} color={C.gray} />
          <Kpi
            label="与全市差距"
            value={courseRate >= cityCourseRate ? `+${f(courseRate - cityCourseRate)}` : f(courseRate - cityCourseRate)}
            unit="pp"
            color={courseRate >= cityCourseRate ? C.green : C.red}
          />
        </StatRow>
      </SubSub>

      <SubSub num="2" title="实验教学">
        <Para>
          {d["名称"]}中小学实验室使用频率及实验教学面临的主要困难如下图所示。
        </Para>
        <div style={{display: "flex", gap: 14}}>
          <ChartCard title="实验室使用频率分布" style={{flex: 1}}>
            <ReactECharts
              option={pieOpt({data: freqCats.map((cat, i) => ({name: cat, value: freq[cat] || 0, color: freqClrs[i]}))})}
              style={{height: 190}}
              opts={{renderer: "canvas"}}
            />
          </ChartCard>
          <ChartCard title="实验教学主要困难（本区 vs 全市）" style={{flex: 1.3}}>
            <ReactECharts
              option={barOpt({
                categories: diffShort,
                series: [
                  {name: "本区", data: diffKeys.map(k => diff_[k] || 0), color: C.accent},
                  {name: "全市", data: diffKeys.map(k => cityDiff[k] || 0), color: "#94a3b8"},
                ],
              })}
              style={{height: 190}}
              opts={{renderer: "canvas"}}
            />
          </ChartCard>
        </div>
        <Para>
          实验教学最主要的困难为
          <b>{diffKeys.reduce((a, k) => (diff_[k] || 0) > (diff_[a] || 0) ? k : a)}</b>
          （{pct(Math.max(...diffKeys.map(k => diff_[k] || 0)))}），
          其次为<b>{[...diffKeys].sort((a, b) => (diff_[b] || 0) - (diff_[a] || 0))[1]}</b>
          （{pct([...diffKeys].map(k => diff_[k] || 0).sort((a, b) => b - a)[1])}）。
        </Para>
      </SubSub>

      <SubSub num="3" title="课程建设">
        <Para>
          截至2025年10月，{d["名称"]}已开设中小学科学类地方课程。2025年以来，本区有
          <b>{pct(curRate)}</b>的中小学校开发了与科学相关的校本课程，
          全市平均为{pct(cityCorseRate)}，<DiffTag a={curRate} b={cityCorseRate} />；
          其中科学动手实践类课程占<b>{pct(practRate)}</b>，
          平均每校开发<b>{f(d["校本课程建设"]["动手实践类数量"], 1)}</b>门。
        </Para>
        <StatRow>
          <Kpi label="校本课程建设比例" value={f(curRate)} />
          <Kpi label="平均开发数量" value={f(d["校本课程建设"]["开发数量"], 1)} unit="门/校" color={C.accent} />
          <Kpi label="动手实践类比例" value={f(practRate)} color={C.green} />
          <Kpi label="动手实践类数量" value={f(d["校本课程建设"]["动手实践类数量"], 1)} unit="门/校" color={C.green} />
        </StatRow>
        <Para>
          课后服务方面，本区有<b>{pct(afterRate)}</b>的义务教育阶段学校将科学教育作为课后服务必备选项，
          全市平均为{pct(cityAfterRate)}，<DiffTag a={afterRate} b={cityAfterRate} />。
        </Para>
      </SubSub>
    </Sub>
  );
}

function SecTeachers({d}) {
  // District: d["专职率"]["小学/初中/高中"]
  // City:     CITY["专职教师"]["按学段"]["小学/初中/高中"]
  const grades = ["小学", "初中", "高中"];
  const cityGradeRate = g => CITY["专职教师"]["按学段"][g];

  const bg = d["教师专业背景"];
  const cityBg = CITY["教师专业背景"];

  const vp = d["科学副校长"]["配备率"];
  const cityVp = CITY["科学副校长"]["配备率"];
  const tc = d["科技辅导员"]["配备率"];
  const cityTc = CITY["科技辅导员"]["配备率"];

  return (
    <Sub title="（二）师资建设">
      <SubSub num="1" title="师资规模">
        <Para>
          {d["名称"]}中小学科学类课程各学段教师规模及专职率如下表所示：
        </Para>
        <Table
          caption={`${d["名称"]}科学类课程教师人数及专职率`}
          headers={["学段", "教师人数（人）", "本区专职率（%）", "全市专职率（%）", "差距"]}
          rows={grades.map(g => [
            g,
            d["教师人数"][g],
            pct(d["专职率"][g]),
            pct(cityGradeRate(g)),
            <span key={g} style={{color: d["专职率"][g] >= cityGradeRate(g) ? C.green : C.red, fontWeight: 600}}>
              {diffPp(d["专职率"][g], cityGradeRate(g))}
            </span>,
          ])}
        />
        <ChartCard title="各学段科学教师专职率（本区 vs 全市）">
          <ReactECharts
            option={barOpt({
              categories: grades,
              series: [
                {name: "本区", data: grades.map(g => d["专职率"][g] || 0), color: C.accent},
                {name: "全市", data: grades.map(g => cityGradeRate(g) || 0), color: "#94a3b8"},
              ],
            })}
            style={{height: 200}}
            opts={{renderer: "canvas"}}
          />
        </ChartCard>
      </SubSub>

      <SubSub num="2" title="专业背景">
        <Para>
          {d["名称"]}科学类课程教师中，理工科专业背景占比为<b>{pct(bg["理工科背景占比"])}</b>，
          全市平均为{pct(cityBg["理工科背景占比"])}，<DiffTag a={bg["理工科背景占比"]} b={cityBg["理工科背景占比"]} />；
          理工类硕士占比为<b>{pct(bg["理工类硕士占比"])}</b>，
          全市平均为{pct(cityBg["理工类硕士占比"])}，<DiffTag a={bg["理工类硕士占比"]} b={cityBg["理工类硕士占比"]} />；
          小学满足至少1名理工类硕士学位科学教师要求的学校占比为<b>{pct(bg["小学满足硕士要求占比"])}</b>，
          全市平均为{pct(cityBg["小学满足硕士要求占比"])}，<DiffTag a={bg["小学满足硕士要求占比"]} b={cityBg["小学满足硕士要求占比"]} />。
        </Para>
        <StatRow>
          <Kpi label="理工科背景占比" value={f(bg["理工科背景占比"])} sub={`全市：${f(cityBg["理工科背景占比"])}%`} />
          <Kpi label="理工类硕士占比" value={f(bg["理工类硕士占比"])} sub={`全市：${f(cityBg["理工类硕士占比"])}%`} color={C.green} />
          <Kpi label="小学满足硕士要求" value={f(bg["小学满足硕士要求占比"])} sub={`全市：${f(cityBg["小学满足硕士要求占比"])}%`} color={C.orange} />
        </StatRow>
      </SubSub>

      <SubSub num="3" title="科学副校长与科技辅导员">
        <Para>
          {d["名称"]}科学副校长配备率为<b>{pct(vp)}</b>，
          全市平均为{pct(cityVp)}，<DiffTag a={vp} b={cityVp} />；
          科技辅导员配备率为<b>{pct(tc)}</b>，
          全市平均为{pct(cityTc)}，<DiffTag a={tc} b={cityTc} />。
        </Para>
        <StatRow>
          <Kpi label="科学副校长配备率" value={f(vp)} sub={`全市：${f(cityVp)}%`} />
          <Kpi label="科技辅导员配备率" value={f(tc)} sub={`全市：${f(cityTc)}%`} color={C.green} />
        </StatRow>
      </SubSub>
    </Sub>
  );
}

function SecResources({d}) {
  const grades = ["小学", "初中", "高中"];

  // District: d["实验室建设"]["实验室间数达标率"]["小学/初中/高中/整体"]
  // City:     CITY["实验室建设"]["按学段"]["小学"]["实验室间数达标率"]
  //           CITY["实验室建设"]["整体"]["实验室间数达标率"]
  const labRooms = d["实验室建设"]["实验室间数达标率"];
  const labArea = d["实验室建设"]["生均使用面积达标率"];
  const cityLabRoomsGrade = g => CITY["实验室建设"]["按学段"][g]["实验室间数达标率"];
  const cityLabAreaGrade = g => CITY["实验室建设"]["按学段"][g]["生均使用面积达标率"];
  const cityLabRoomsTotal = CITY["实验室建设"]["整体"]["实验室间数达标率"];
  const cityLabAreaTotal = CITY["实验室建设"]["整体"]["生均使用面积达标率"];

  const inst = d["实验仪器达标"];
  const cityInst = CITY["实验仪器达标"];

  const equip = d["实验器材更新"];
  const equipItems = ["每年更新", "不定期更新", "近三年未更新", "从未更新"];
  const equipClrs = [C.green, C.accent, C.orange, C.red];

  const cons = d["实验耗材采购"];
  const consItems = ["未采购", "1-500元", "501-1000元", "1001-5000元", "5001元及以上"];
  const consClrs = [C.red, C.orange, "#eab308", C.accent, C.green];

  return (
    <Sub title="（三）资源设备">
      <SubSub num="1" title="实验室建设">
        <Para>
          {d["名称"]}中小学实验室建设整体达标情况：实验室间数达标率为
          <b>{pct(labRooms["整体"] || 0)}</b>，
          全市为{pct(cityLabRoomsTotal)}，
          <DiffTag a={labRooms["整体"] || 0} b={cityLabRoomsTotal} />；
          生均使用面积达标率为<b>{pct(labArea["整体"] || 0)}</b>，
          全市为{pct(cityLabAreaTotal)}，
          <DiffTag a={labArea["整体"] || 0} b={cityLabAreaTotal} />。
        </Para>
        <Table
          caption="实验室建设达标率分学段（%）"
          headers={["学段", "间数达标率（本区）", "间数达标率（全市）", "面积达标率（本区）", "面积达标率（全市）"]}
          rows={grades.map(g => [
            g,
            pct(labRooms[g] || 0),
            pct(cityLabRoomsGrade(g)),
            pct(labArea[g] || 0),
            pct(cityLabAreaGrade(g)),
          ])}
        />
        <ChartCard title="实验室建设达标率（按学段，本区 vs 全市）">
          <ReactECharts
            option={barOpt({
              categories: grades,
              series: [
                {name: "间数达标（本区）", data: grades.map(g => labRooms[g] || 0), color: C.accent},
                {name: "面积达标（本区）", data: grades.map(g => labArea[g] || 0), color: C.green},
                {name: "间数达标（全市）", data: grades.map(g => cityLabRoomsGrade(g)), color: "#93c5fd"},
                {name: "面积达标（全市）", data: grades.map(g => cityLabAreaGrade(g)), color: "#86efac"},
              ],
              grid: {top: 28, bottom: 36, left: 6, right: 28, containLabel: true},
            })}
            style={{height: 230}}
            opts={{renderer: "canvas"}}
          />
        </ChartCard>
      </SubSub>

      <SubSub num="2" title="实验仪器及器材">
        <Para>
          {d["名称"]}中小学实验仪器配备达标情况：小学达标率<b>{pct(inst["小学"])}</b>（全市{pct(cityInst["小学"])}），
          初中达标率<b>{pct(inst["初中"])}</b>（全市{pct(cityInst["初中"])}），
          高中达标率<b>{pct(inst["高中"])}</b>（全市{pct(cityInst["高中"])}）。
        </Para>
        <div style={{display: "flex", gap: 14}}>
          <ChartCard title="实验器材更新情况" style={{flex: 1}}>
            <ReactECharts
              option={pieOpt({data: equipItems.map((item, i) => ({name: item, value: equip[item] || 0, color: equipClrs[i]}))})}
              style={{height: 190}}
              opts={{renderer: "canvas"}}
            />
          </ChartCard>
          <ChartCard title="实验耗材采购情况" style={{flex: 1}}>
            <ReactECharts
              option={pieOpt({data: consItems.map((item, i) => ({name: item, value: cons[item] || 0, color: consClrs[i]}))})}
              style={{height: 190}}
              opts={{renderer: "canvas"}}
            />
          </ChartCard>
        </div>
      </SubSub>
    </Sub>
  );
}

function SecSocial({d}) {
  const pair = d["机构结对"];
  const cityPair = CITY["机构结对"]["整体"];

  const jinlai = d["请进来活动"];
  const cityJinlai = CITY["请进来活动"]["整体"];
  const zhuqu = d["走出去活动"];
  const cityZhuqu = CITY["走出去活动"]["整体"];

  const jinlaiKeys = Object.keys(jinlai);
  const zhuquKeys = Object.keys(zhuqu);

  return (
    <Sub title="（四）社会协同">
      <SubSub num="1" title="机构结对">
        <Para>
          {d["名称"]}校外科技教育机构与学校结对比例为<b>{pct(pair["结对比例"])}</b>，
          全市平均为{pct(cityPair["结对比例"])}，
          <DiffTag a={pair["结对比例"]} b={cityPair["结对比例"]} />；
          平均结对个数为<b>{f(pair["结对个数"], 1)}</b>个（全市{f(cityPair["结对个数"], 1)}个）；
          免费结对比例为<b>{pct(pair["免费结对比例"])}</b>，
          平均免费结对个数为<b>{f(pair["免费结对个数"], 1)}</b>个。
        </Para>
        <StatRow>
          <Kpi label="结对比例" value={f(pair["结对比例"])} sub={`全市：${f(cityPair["结对比例"])}%`} />
          <Kpi label="平均结对个数" value={f(pair["结对个数"], 1)} unit="个" color={C.green} sub={`全市：${f(cityPair["结对个数"], 1)}个`} />
          <Kpi label="免费结对比例" value={f(pair["免费结对比例"])} color={C.orange} />
          <Kpi label="免费结对个数" value={f(pair["免费结对个数"], 1)} unit="个" color={C.orange} />
        </StatRow>
      </SubSub>

      <SubSub num="2" title="科学实践活动">
        <Para>
          {d["名称"]}积极开展&ldquo;请进来&rdquo;和&ldquo;走出去&rdquo;科学实践活动，各类活动参与情况如下：
        </Para>
        <ChartCard title="「请进来」活动参与率（本区 vs 全市）">
          <ReactECharts
            option={barOpt({
              categories: jinlaiKeys,
              horizontal: true,
              series: [
                {name: "本区", data: jinlaiKeys.map(k => jinlai[k] || 0), color: C.accent},
                {name: "全市", data: jinlaiKeys.map(k => cityJinlai[k] || 0), color: "#94a3b8"},
              ],
              grid: {top: 8, bottom: 28, left: 6, right: 36, containLabel: true},
            })}
            style={{height: Math.max(160, jinlaiKeys.length * 32 + 50)}}
            opts={{renderer: "canvas"}}
          />
        </ChartCard>
        <ChartCard title="「走出去」活动参与率（本区 vs 全市）">
          <ReactECharts
            option={barOpt({
              categories: zhuquKeys,
              horizontal: true,
              series: [
                {name: "本区", data: zhuquKeys.map(k => zhuqu[k] || 0), color: C.green},
                {name: "全市", data: zhuquKeys.map(k => cityZhuqu[k] || 0), color: "#94a3b8"},
              ],
              grid: {top: 8, bottom: 28, left: 6, right: 36, containLabel: true},
            })}
            style={{height: Math.max(120, zhuquKeys.length * 40 + 50)}}
            opts={{renderer: "canvas"}}
          />
        </ChartCard>
      </SubSub>
    </Sub>
  );
}

function SecIssues({d}) {
  // Determine issues based on district vs city comparison
  const checks = [
    {label: "课程达标率", val: d["课程落实"]["达标率"], cityVal: CITY["课程落实"]["达标率"], reverse: false},
    {label: "课后服务纳入科学教育", val: d["课后服务"]["比例"], cityVal: CITY["课后服务"]["比例"], reverse: false},
    {label: "科学副校长配备率", val: d["科学副校长"]["配备率"], cityVal: CITY["科学副校长"]["配备率"], reverse: false},
    {label: "科技辅导员配备率", val: d["科技辅导员"]["配备率"], cityVal: CITY["科技辅导员"]["配备率"], reverse: false},
    {label: "理工科背景教师占比", val: d["教师专业背景"]["理工科背景占比"], cityVal: CITY["教师专业背景"]["理工科背景占比"], reverse: false},
    {label: "理工类硕士占比", val: d["教师专业背景"]["理工类硕士占比"], cityVal: CITY["教师专业背景"]["理工类硕士占比"], reverse: false},
    {label: "小学满足硕士要求占比", val: d["教师专业背景"]["小学满足硕士要求占比"], cityVal: CITY["教师专业背景"]["小学满足硕士要求占比"], reverse: false},
    {label: "实验室间数达标率", val: d["实验室建设"]["实验室间数达标率"]["整体"] || 0, cityVal: CITY["实验室建设"]["整体"]["实验室间数达标率"], reverse: false},
    {label: "生均面积达标率", val: d["实验室建设"]["生均使用面积达标率"]["整体"] || 0, cityVal: CITY["实验室建设"]["整体"]["生均使用面积达标率"], reverse: false},
    {label: "校本课程建设比例", val: d["校本课程建设"]["建设比例"], cityVal: CITY["校本课程建设"]["整体"]["建设比例"], reverse: false},
    {label: "机构结对比例", val: d["机构结对"]["结对比例"], cityVal: CITY["机构结对"]["整体"]["结对比例"], reverse: false},
  ];

  const below = checks.filter(c => c.reverse ? c.val > c.cityVal : c.val < c.cityVal);
  const above = checks.filter(c => c.reverse ? c.val <= c.cityVal : c.val >= c.cityVal);

  // Top difficulties
  const diffKeys = ["实验场地和设备不足", "耗材经费有限", "教师实验教学能力有待提升", "课时不够", "安全隐患问题"];
  const diff_ = d["实验教学困难"];
  const topDiffs = [...diffKeys].sort((a, b) => (diff_[b] || 0) - (diff_[a] || 0)).slice(0, 3);

  // Ranking helper
  function rank(getVal) {
    const sorted = [...DISTRICTS_DATA].sort((a, b) => getVal(b) - getVal(a));
    return sorted.findIndex(x => x["名称"] === d["名称"]) + 1;
  }

  const rankRows = [
    {key: "课程达标率", get: x => x["课程落实"]["达标率"]},
    {key: "课后服务比例", get: x => x["课后服务"]["比例"]},
    {key: "科学副校长配备率", get: x => x["科学副校长"]["配备率"]},
    {key: "机构结对比例", get: x => x["机构结对"]["结对比例"]},
    {key: "理工科背景占比", get: x => x["教师专业背景"]["理工科背景占比"]},
    {key: "实验室间数达标率", get: x => x["实验室建设"]["实验室间数达标率"]["整体"] || 0},
    {key: "生均面积达标率", get: x => x["实验室建设"]["生均使用面积达标率"]["整体"] || 0},
  ].map(m => {
    const r = rank(m.get);
    const n = DISTRICTS_DATA.length;
    const tier = r <= 3 ? "前三名" : r <= Math.ceil(n / 2) ? "中上游" : "有待提升";
    const tierColor = r <= 3 ? C.green : r <= Math.ceil(n / 2) ? C.accent : C.orange;
    return [m.key, pct(m.get(d)), `第${r}名 / 共${n}个区`, <span key={m.key} style={{color: tierColor, fontWeight: 600}}>{tier}</span>];
  });

  return (
    <Section num="二、" title="重点关注方面">
      <Sub title="（一）主要问题">
        <Para>根据调查结果，{d["名称"]}在中小学科学教育工作中实验教学面临的主要困难如下：</Para>
        <div style={{marginBottom: 14}}>
          {topDiffs.map((issue, i) => (
            <div key={issue} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              marginBottom: 10, padding: "10px 14px",
              background: i === 0 ? C.redLight : C.grayLight,
              borderRadius: 6,
              borderLeft: `4px solid ${i === 0 ? C.red : C.border}`,
            }}>
              <span style={{fontSize: 13, fontWeight: 800, color: i === 0 ? C.red : C.gray, minWidth: 20}}>
                {["①", "②", "③"][i]}
              </span>
              <span style={{fontWeight: 700, color: C.text, fontSize: 13}}>{issue}</span>
              <span style={{fontSize: 12, color: C.muted, marginLeft: 4}}>
                本区 {pct(diff_[issue])}
                {" · "}全市 {pct(CITY["实验教学困难"]["整体"][issue])}
              </span>
            </div>
          ))}
        </div>
      </Sub>

      <Sub title="（二）低于全市平均水平的事项">
        {below.length === 0 ? (
          <div style={{
            background: C.greenLight, border: `1px solid ${C.green}`,
            borderRadius: 6, padding: "12px 16px",
            fontSize: 13, color: "#166534", fontWeight: 600,
          }}>
            {d["名称"]}在所有监测指标中均达到或超过全市平均水平，总体表现优秀。
          </div>
        ) : (
          <>
            <Para>以下{below.length}项指标低于全市平均水平，需重点关注：</Para>
            <Table
              headers={["指标", `${d["名称"]}`, "全市平均", "差距"]}
              rows={below.map((c, i) => [
                c.label,
                pct(c.val),
                pct(c.cityVal),
                <span key={i} style={{color: C.red, fontWeight: 600}}>{diffPp(c.val, c.cityVal)}</span>,
              ])}
            />
          </>
        )}
        {above.length > 0 && (
          <>
            <div style={{fontSize: 13, fontWeight: 700, color: C.green, margin: "16px 0 8px"}}>
              优势指标（高于全市平均水平）
            </div>
            <Table
              headers={["指标", `${d["名称"]}`, "全市平均", "领先"]}
              rows={above.map((c, i) => [
                c.label,
                pct(c.val),
                pct(c.cityVal),
                <span key={i} style={{color: C.green, fontWeight: 600}}>{diffPp(c.val, c.cityVal)}</span>,
              ])}
            />
          </>
        )}
      </Sub>

      <Sub title="（三）区县排名概览">
        <Para>下表为{d["名称"]}在全市各区县主要指标中的排名情况：</Para>
        <Table headers={["指标", "本区数值", "全市排名", "评级"]} rows={rankRows} />
      </Sub>
    </Section>
  );
}

// ── Cover ─────────────────────────────────────────────────────────────────────
function Cover({d}) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
      color: "#fff", padding: "60px 60px 48px",
      borderRadius: "8px 8px 0 0",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "rgba(255,255,255,0.05)", borderRadius: "50%", transform: "translate(60px,-60px)"}} />
      <div style={{position: "absolute", bottom: 0, left: 0, width: 120, height: 120, background: "rgba(255,255,255,0.05)", borderRadius: "50%", transform: "translate(-40px,40px)"}} />
      <div style={{fontSize: 12, letterSpacing: "0.15em", opacity: 0.7, marginBottom: 16}}>内部资料 · 请勿外传</div>
      <div style={{fontSize: 13, opacity: 0.8, marginBottom: 8}}>2025年中小学科学教育工作诊断报告</div>
      <div style={{fontSize: 32, fontWeight: 900, letterSpacing: "0.08em", marginBottom: 8}}>{d["名称"]}</div>
      <div style={{fontSize: 14, opacity: 0.9}}>北京市科学教育专项诊断区县报告</div>
      <div style={{display: "flex", gap: 32, marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.2)"}}>
        {[["报告期", "2025年度"], ["发布机构", "教育部教育质量评估中心"], ["发布时间", "2026年3月"]].map(([k, v]) => (
          <div key={k}>
            <div style={{fontSize: 10, opacity: 0.6, marginBottom: 4}}>{k}</div>
            <div style={{fontSize: 14, fontWeight: 600}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function DistrictReportPage({match}) {
  const districtName = match?.params?.districtName
    ? decodeURIComponent(match.params.districtName)
    : null;

  const d = districtName
    ? DISTRICTS_DATA.find(x => x["名称"] === districtName)
    : DISTRICTS_DATA[0];

  if (!d) {
    return (
      <div style={{padding: 60, textAlign: "center", color: C.gray, fontSize: 16}}>
        未找到「{districtName}」的数据
      </div>
    );
  }

  const tocItems = [
    ["一、工作基本情况", [
      "（一）课程教学：1.课程落实　2.实验教学　3.课程建设",
      "（二）师资建设：1.师资规模　2.专业背景　3.科学副校长与科技辅导员",
      "（三）资源设备：1.实验室建设　2.实验仪器及器材",
      "（四）社会协同：1.机构结对　2.科学实践活动",
    ]],
    ["二、重点关注方面", [
      "（一）主要问题",
      "（二）低于全市平均水平的事项",
      "（三）区县排名概览",
    ]],
  ];

  return (
    <div style={{background: "#f8fafc", minHeight: "100vh", padding: "24px 0 40px", fontFamily: "'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif"}}>
      <div style={{maxWidth: 960, margin: "0 auto", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.10)", borderRadius: 8}}>

        <Cover d={d} />

        <div style={{padding: "40px 60px"}}>

          {/* Summary */}
          <div style={{background: C.accentLight, border: `1px solid ${C.accent}`, borderRadius: 8, padding: "16px 20px", marginBottom: 32, fontSize: 13, lineHeight: 1.8, color: C.primary}}>
            <div style={{fontWeight: 800, marginBottom: 6, fontSize: 14}}>报告摘要</div>
            2025年中小学科学教育工作专项诊断调查在31个省（自治区、直辖市）和新疆生产建设兵团开展。
            北京市共有18个县（市、区）参与了本次调查，通过对本次调查结果和其他相关数据开展全面分析，形成本报告。
            <div style={{marginTop: 8}}>
              <b>本区核心指标：</b>
              课程达标率 <b>{pct(d["课程落实"]["达标率"])}</b>，
              科学副校长配备率 <b>{pct(d["科学副校长"]["配备率"])}</b>，
              机构结对比例 <b>{pct(d["机构结对"]["结对比例"])}</b>。
            </div>
          </div>

          {/* TOC */}
          <div style={{marginBottom: 36, padding: "16px 20px", background: C.grayLight, borderRadius: 8}}>
            <div style={{fontWeight: 800, fontSize: 14, color: C.primary, marginBottom: 10}}>目录</div>
            {tocItems.map(([title, subs]) => (
              <div key={title} style={{marginBottom: 8}}>
                <div style={{fontWeight: 700, color: C.text, fontSize: 13}}>{title}</div>
                {subs.map(sub => (
                  <div key={sub} style={{fontSize: 12, color: C.muted, paddingLeft: 20, marginTop: 2}}>• {sub}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Body */}
          <Section num="一、" title="工作基本情况">
            <SecCourseTeaching d={d} />
            <SecTeachers d={d} />
            <SecResources d={d} />
            <SecSocial d={d} />
          </Section>

          <SecIssues d={d} />
        </div>
      </div>
    </div>
  );
}

export default DistrictReportPage;
