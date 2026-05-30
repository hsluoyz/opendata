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
import {Affix, Button} from "antd";
import {DownloadOutlined} from "@ant-design/icons";
import {Helmet} from "react-helmet";
import ReactECharts from "echarts-for-react";
import dashboardData from "./DashboardData.json";

const DISTRICTS_DATA = dashboardData["区县数据"];
const CITY = dashboardData["市级数据"];
const META = dashboardData["元数据"];

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
  tableHeader: "#1a3a6b",
  tableAlt: "#f8fafc",
};

const SERIES_COLORS = ["#2563b0", "#16a34a", "#ea580c", "#7c3aed", "#db2777", "#0891b2"];

// ── Formatters ────────────────────────────────────────────────────────────────
function f(v, dec = 2) {
  if (v === null || v === undefined) {return "—";}
  return Number(v).toFixed(dec);
}
function pct(v, dec = 2) {
  if (v === null || v === undefined) {return "—";}
  return `${Number(v).toFixed(dec)}%`;
}
function absDiffPp(a, b, dec = 2) {
  if (a === null || a === undefined || b === null || b === undefined) {return "—";}
  const d = a - b;
  return `${d >= 0 ? "+" : ""}${d.toFixed(dec)}pp`;
}

// ── Layout atoms ──────────────────────────────────────────────────────────────
function H1({num, title}) {
  return (
    <div style={{
      fontSize: 17, fontWeight: 800, color: C.primary,
      borderBottom: `3px solid ${C.accent}`,
      paddingBottom: 7, marginBottom: 24, letterSpacing: "0.03em",
    }}>
      {num && <span style={{color: C.accent, marginRight: 6}}>{num}</span>}
      {title}
    </div>
  );
}

function H2({title}) {
  return (
    <div style={{
      fontSize: 15, fontWeight: 700, color: C.primary,
      borderLeft: `4px solid ${C.accent}`,
      paddingLeft: 10, marginBottom: 16, marginTop: 4,
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
        display: "inline-block", width: 22, height: 22, flexShrink: 0,
        background: C.accent, color: "#fff", borderRadius: "50%",
        fontSize: 11, textAlign: "center", lineHeight: "22px",
      }}>{num}</span>
      {title}
    </div>
  );
}

function Section({num, title, children, id}) {
  return (
    <div id={id} style={{marginBottom: 40}}>
      <H1 num={num} title={title} />
      {children}
    </div>
  );
}

function Sub({title, children, id}) {
  return (
    <div id={id} style={{marginBottom: 28}}>
      <H2 title={title} />
      {children}
    </div>
  );
}

function SubSub({num, title, children, id}) {
  return (
    <div id={id} style={{marginBottom: 22, pageBreakInside: "avoid", breakInside: "avoid"}}>
      <H3 num={num} title={title} />
      <div style={{paddingLeft: 28}}>{children}</div>
    </div>
  );
}

function Para({children, style}) {
  return (
    <p style={{
      fontSize: 13, lineHeight: 2.0, color: C.text,
      marginBottom: 10, textIndent: "2em", ...style,
    }}>
      {children}
    </p>
  );
}

function StatRow({children}) {
  return <div style={{display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap"}}>{children}</div>;
}

function Kpi({label, value, unit = "%", sub, color = C.accent}) {
  return (
    <div style={{
      flex: 1, minWidth: 120, background: "#fff", borderRadius: 6, padding: "12px 16px",
      border: `1px solid ${C.border}`, borderTop: `3px solid ${color}`, textAlign: "center",
    }}>
      <div style={{fontSize: 11, color: C.muted, marginBottom: 4}}>{label}</div>
      <div style={{fontSize: 22, fontWeight: 800, color, lineHeight: 1.15}}>
        {value}<span style={{fontSize: 12, fontWeight: 600, color: C.muted, marginLeft: 2}}>{unit}</span>
      </div>
      {sub && <div style={{fontSize: 10, color: C.muted, marginTop: 3}}>{sub}</div>}
    </div>
  );
}

function DataTable({headers, rows, caption, style}) {
  return (
    <div style={{marginBottom: 14, overflowX: "auto", ...style}}>
      {caption && (
        <div style={{fontSize: 12, color: C.muted, marginBottom: 5, textAlign: "center", fontWeight: 600}}>{caption}</div>
      )}
      <table style={{width: "100%", borderCollapse: "collapse", fontSize: 12}}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                background: C.tableHeader, color: "#fff", padding: "8px 10px",
                textAlign: i === 0 ? "left" : "center", fontWeight: 700, fontSize: 12,
                borderRight: i < headers.length - 1 ? "1px solid rgba(255,255,255,0.2)" : undefined,
                whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{background: ri % 2 === 0 ? "#fff" : C.tableAlt}}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: "7px 10px",
                  textAlign: ci === 0 ? "left" : "center",
                  borderBottom: `1px solid ${C.border}`,
                  borderRight: ci < row.length - 1 ? `1px solid ${C.border}` : undefined,
                  color: C.text,
                  whiteSpace: ci === 0 ? "nowrap" : undefined,
                  fontWeight: row._bold ? 700 : undefined,
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
      borderRadius: 6, padding: "12px 14px", marginBottom: 14,
      pageBreakInside: "avoid", breakInside: "avoid",
      ...style,
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

// highlight cells that are above or below reference
function cmp(val, ref) {
  if (val === null || val === undefined || ref === null || ref === undefined) {return C.text;}
  return val >= ref ? C.green : C.red;
}

function CmpCell({val, refVal, dec = 2}) {
  const color = cmp(val, refVal);
  const d = val - refVal;
  return (
    <span style={{color, fontWeight: 600}}>
      {pct(val, dec)}{" "}
      <span style={{fontSize: 10}}>({d >= 0 ? "+" : ""}{d.toFixed(dec)}pp)</span>
    </span>
  );
}

// ── ECharts option builders ───────────────────────────────────────────────────
function barOpt({categories, series, horizontal = false, maxVal = 100, grid, unit = "%"}) {
  const hasLegend = series.length > 1;
  const baseGrid = {top: 30, bottom: hasLegend ? 28 : 8, left: 6, right: 36, containLabel: true};
  const fmtLabel = v => `${(v || 0).toFixed(1)}${unit}`;
  const xAxis = horizontal
    ? {type: "value", max: maxVal, axisLabel: {formatter: v => `${v}${unit}`, fontSize: 10, color: C.gray}, splitLine: {lineStyle: {color: "#e2e8f0"}}}
    : {type: "category", data: categories, axisLabel: {fontSize: 10, color: C.text}, axisTick: {show: false}, axisLine: {lineStyle: {color: C.border}}};
  const yAxis = horizontal
    ? {type: "category", data: categories, axisLabel: {fontSize: 10, color: C.text}, axisTick: {show: false}, axisLine: {lineStyle: {color: C.border}}}
    : {type: "value", max: maxVal, axisLabel: {formatter: v => `${v}${unit}`, fontSize: 10, color: C.gray}, splitLine: {lineStyle: {color: "#e2e8f0"}}};
  return {
    backgroundColor: "transparent",
    grid: grid || baseGrid,
    legend: hasLegend ? {bottom: 0, textStyle: {fontSize: 10, color: C.text}, itemWidth: 10, itemHeight: 10} : undefined,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255,255,255,0.97)",
      borderColor: C.border,
      textStyle: {color: C.text, fontSize: 11},
      formatter: params => {
        const label = params[0]?.axisValue || "";
        return label + "<br/>" + params.map(p => `${p.marker}${p.seriesName}: <b>${(p.value || 0).toFixed(1)}${unit}</b>`).join("<br/>");
      },
    },
    xAxis,
    yAxis,
    series: series.map((s, i) => ({
      name: s.name,
      type: "bar",
      barMaxWidth: 36,
      barGap: "10%",
      barCategoryGap: "35%",
      data: s.data.map(v => ({
        value: v,
        itemStyle: {color: s.color || SERIES_COLORS[i], borderRadius: horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]},
      })),
      label: {
        show: true,
        position: horizontal ? "right" : "top",
        formatter: p => fmtLabel(p.value),
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
      radius: ["36%", "60%"],
      center: ["38%", "50%"],
      data: data.map((d, i) => ({
        name: d.name, value: d.value,
        itemStyle: {color: d.color || SERIES_COLORS[i]},
      })),
      label: {
        show: true,
        position: "inside",
        formatter: p => p.value > 4 ? `${p.value.toFixed(0)}%` : "",
        color: "#fff", fontSize: 10, fontWeight: "bold",
      },
    }],
  };
}

// ── Section 1: 课程教学 ──────────────────────────────────────────────────────
function SecCourseTeaching({d}) {
  const cityRate = CITY["课程落实"]["达标率"];
  const dRate = d["课程落实"]["达标率"];

  // 实验室使用频率
  const freqKeys = ["几乎没有", "每学期1-2次", "每月1-2次", "每周1-2次", "每周3次及以上"];
  const freqClrs = [C.red, "#f97316", "#eab308", "#22c55e", C.accent];
  const freq = d["实验室使用频率"];
  const dWeekly = (freq["每周1-2次"] || 0) + (freq["每周3次及以上"] || 0);
  const cityWeekly = CITY["实验室使用频率"]["每周至少1次的学校比例"];
  const cityEntryRate = CITY["实验室使用频率"]["学生进入实验室比例"];

  // 实验耗材采购
  const consKeys = ["未采购", "1-500元", "501-1000元", "1001-5000元", "5001元及以上"];
  const consClrs = [C.red, C.orange, "#eab308", C.accent, C.green];
  const cons = d["实验耗材采购"];
  const dConsRate = 100 - (cons["未采购"] || 0);
  const cityConsRate = CITY["实验耗材采购"]["采购率"];

  // 实验教学困难
  const diffKeys = ["实验场地和设备不足", "耗材经费有限", "教师实验教学能力有待提升", "课时不够", "安全隐患问题"];
  const diffShort = ["场地设备不足", "耗材经费有限", "教师能力提升", "课时不够", "安全隐患"];
  const diff_ = d["实验教学困难"];
  const cityDiff = CITY["实验教学困难"]["整体"];

  // 实验教学类型（全市数据）
  const cityExpData = CITY["实验教学类型"];

  // 校本课程
  const citySchoolCurRate = CITY["校本课程建设"]["整体"]["建设比例"];
  const dSchoolCurRate = d["校本课程建设"]["建设比例"];
  const dPractRate = d["校本课程建设"]["动手实践类比例"];
  const dDevNum = d["校本课程建设"]["开发数量"];
  const dPractNum = d["校本课程建设"]["动手实践类数量"];

  // 课后服务
  const cityAfterRate = CITY["课后服务"]["比例"];
  const dAfterRate = d["课后服务"]["比例"];

  return (
    <Sub id="sub-1-1" title="（一）课程教学">
      <SubSub id="subsub-1-1-1" num="1" title="课程落实">
        <Para>
          2025年，{d["名称"]}共有<b>{pct(dRate)}</b>的义务教育学校科学类课程课时数达到《义务教育课程方案和课程标准（2022年版）》的要求，
          {dRate >= cityRate
            ? <span>高于全市平均水平（{pct(cityRate)}），领先{(dRate - cityRate).toFixed(2)}个百分点。</span>
            : <span>低于全市平均水平（{pct(cityRate)}），差距{(cityRate - dRate).toFixed(2)}个百分点。</span>
          }
        </Para>
        <StatRow>
          <Kpi label="本区课程达标率" value={f(dRate)} color={dRate >= cityRate ? C.green : C.red} />
          <Kpi label="全市平均水平" value={f(cityRate)} color={C.gray} />
          <Kpi
            label="与全市差距"
            value={(dRate - cityRate) >= 0 ? `+${f(dRate - cityRate)}` : f(dRate - cityRate)}
            unit="pp"
            color={(dRate - cityRate) >= 0 ? C.green : C.red}
          />
        </StatRow>
        <DataTable
          caption={`表1  ${d["名称"]}与全市义务教育学校科学类课程课时达标情况对比`}
          headers={["单位", "达标率（%）"]}
          rows={[
            ["全市平均", pct(cityRate)],
            [d["名称"], <CmpCell key="c" val={dRate} refVal={cityRate} />],
          ]}
        />
      </SubSub>

      <SubSub id="subsub-1-1-2" num="2" title="实验教学">
        <H3 num="(1)" title="实验室使用频率" />
        <div style={{paddingLeft: 28}}>
          <Para>
            {d["名称"]}中小学进入实验室开展实验教学的学校中，每周至少进入1次实验室的学校比例为
            <b>{pct(dWeekly)}</b>，全市平均水平为{pct(cityWeekly)}，
            {dWeekly >= cityWeekly
              ? <span>高于全市平均水平，领先{(dWeekly - cityWeekly).toFixed(2)}个百分点。</span>
              : <span>低于全市平均水平，差距{(cityWeekly - dWeekly).toFixed(2)}个百分点。</span>
            }
            全市中小学学生进入实验室进行理化生和科学实验教学的学校比例为{pct(cityEntryRate)}。
          </Para>
          <ChartCard title={`图1  ${d["名称"]}中小学实验室使用频率分布（%）`}>
            <ReactECharts
              option={pieOpt({data: freqKeys.map((k, i) => ({name: k, value: freq[k] || 0, color: freqClrs[i]}))})}
              style={{height: 200}}
              opts={{renderer: "svg"}}
            />
          </ChartCard>
          <DataTable
            caption={`表2  ${d["名称"]}与全市中小学实验室使用频率对比（%）`}
            headers={["单位", "几乎没有", "每学期1-2次", "每月1-2次", "每周1-2次", "每周3次及以上", "每周至少1次"]}
            rows={[
              ["全市平均",
                pct(CITY["实验室使用频率"]["按区域"]["城区"]["几乎没有"] ?? 1.06, 2),
                "—", "—", "—", "—", pct(cityWeekly)],
              [d["名称"],
                pct(freq["几乎没有"]),
                pct(freq["每学期1-2次"]),
                pct(freq["每月1-2次"]),
                pct(freq["每周1-2次"]),
                pct(freq["每周3次及以上"]),
                <CmpCell key="w" val={dWeekly} refVal={cityWeekly} />],
            ]}
          />
        </div>

        <H3 num="(2)" title="实验教学开展情况" />
        <div style={{paddingLeft: 28}}>
          <Para>
            根据《义务教育科学课程标准（2022年版）》《普通高中课程标准（2017年版2020年修订）》和《中小学实验教学基本目录（2023年版）》等相关标准，
            2024—2025学年各学科实验教学开展情况如下表所示（全市数据）。
          </Para>
          <DataTable
            caption="表3  全市各学段科学课程实验教学开展情况（%）"
            headers={["学科课程", "学生必做实验", "教师演示实验", "跨学科实践活动", "新技术实验"]}
            rows={cityExpData ? Object.entries(cityExpData).map(([subj, vals]) => [
              subj,
              pct(vals["学生必做实验"]),
              pct(vals["教师演示实验"]),
              pct(vals["跨学科实践活动"]),
              pct(vals["新技术实验"]),
            ]) : [
              ["小学科学", "73.59%", "72.32%", "71.62%", "55.00%"],
              ["初中物理", "96.10%", "95.78%", "91.72%", "59.25%"],
              ["初中化学", "95.13%", "94.97%", "90.91%", "56.66%"],
              ["初中生物学", "96.75%", "91.72%", "92.21%", "56.82%"],
              ["初中地理", "74.84%", "79.06%", "38.10%", "56.98%"],
              ["高中物理", "88.48%", "87.92%", "66.85%", "57.02%"],
              ["高中化学", "88.20%", "87.36%", "66.29%", "48.60%"],
              ["高中生物学", "88.20%", "82.58%", "68.26%", "53.93%"],
              ["高中地理", "65.17%", "75.00%", "70.22%", "54.21%"],
            ]}
          />
        </div>

        <H3 num="(3)" title="实验耗材采购" />
        <div style={{paddingLeft: 28}}>
          <Para>
            2025年，{d["名称"]}共有<b>{pct(dConsRate)}</b>的中小学完成了学科实验教学所需的低值易耗品（含植物、药品及试剂、易耗工具及器具等）的采购，
            全市平均水平为{pct(cityConsRate)}，
            {dConsRate >= cityConsRate
              ? <span>高于全市平均水平，领先{(dConsRate - cityConsRate).toFixed(2)}个百分点。</span>
              : <span>低于全市平均水平，差距{(cityConsRate - dConsRate).toFixed(2)}个百分点。</span>
            }
          </Para>
          <div style={{display: "flex", gap: 14, pageBreakInside: "avoid", breakInside: "avoid"}}>
            <ChartCard title={`图2  ${d["名称"]}中小学实验耗材采购金额分布（%）`} style={{flex: 1}}>
              <ReactECharts
                option={pieOpt({data: consKeys.map((k, i) => ({name: k, value: cons[k] || 0, color: consClrs[i]}))})}
                style={{height: 200}}
                opts={{renderer: "svg"}}
              />
            </ChartCard>
            <ChartCard title="图3  实验耗材采购率对比（%）" style={{flex: 1}}>
              <ReactECharts
                option={barOpt({
                  categories: ["全市平均", d["名称"]],
                  series: [{
                    name: "采购率",
                    data: [cityConsRate, dConsRate],
                    color: C.accent,
                  }],
                  maxVal: 105,
                })}
                style={{height: 200}}
                opts={{renderer: "svg"}}
              />
            </ChartCard>
          </div>
        </div>

        <H3 num="(4)" title="实验教学开展阻碍因素" />
        <div style={{paddingLeft: 28}}>
          <Para>
            {d["名称"]}中小学实验教学开展阻碍因素中，
            排名第一的为<b>{diffKeys.reduce((a, k) => (diff_[k] || 0) > (diff_[a] || 0) ? k : a)}</b>
            （{pct(Math.max(...diffKeys.map(k => diff_[k] || 0)))}），
            其次为<b>{[...diffKeys].sort((a, b) => (diff_[b] || 0) - (diff_[a] || 0))[1]}</b>
            （{pct([...diffKeys].map(k => diff_[k] || 0).sort((a, b) => b - a)[1])}）。
          </Para>
          <ChartCard title={`图4  ${d["名称"]}与全市中小学实验教学阻碍因素对比（%）`}>
            <ReactECharts
              option={barOpt({
                categories: diffShort,
                series: [
                  {name: "本区", data: diffKeys.map(k => diff_[k] || 0), color: C.accent},
                  {name: "全市", data: diffKeys.map(k => cityDiff[k] || 0), color: "#94a3b8"},
                ],
              })}
              style={{height: 210}}
              opts={{renderer: "svg"}}
            />
          </ChartCard>
          <DataTable
            caption={`表4  ${d["名称"]}与全市中小学实验教学阻碍因素对比（%）`}
            headers={["阻碍因素", "本区（%）", "全市（%）", "差距"]}
            rows={diffKeys.map(k => [
              k,
              pct(diff_[k]),
              pct(cityDiff[k]),
              <span key={k} style={{color: (diff_[k] || 0) <= (cityDiff[k] || 0) ? C.green : C.red, fontWeight: 600}}>
                {absDiffPp(diff_[k], cityDiff[k])}
              </span>,
            ])}
          />
        </div>
      </SubSub>

      <SubSub id="subsub-1-1-3" num="3" title="课程建设">
        <Para>
          截至2025年10月，{d["名称"]}已开设中小学科学类地方课程。
          2025年以来，本区有<b>{pct(dSchoolCurRate)}</b>的中小学校开发了与科学相关的校本课程，
          全市平均水平为{pct(citySchoolCurRate)}，
          {dSchoolCurRate >= citySchoolCurRate
            ? <span>高于全市平均水平，领先{(dSchoolCurRate - citySchoolCurRate).toFixed(2)}个百分点；</span>
            : <span>低于全市平均水平，差距{(citySchoolCurRate - dSchoolCurRate).toFixed(2)}个百分点；</span>
          }
          其中科学动手实践类课程占<b>{pct(dPractRate)}</b>，
          平均每校开发校本课程<b>{f(dDevNum, 1)}</b>门（其中动手实践类<b>{f(dPractNum, 1)}</b>门）。
        </Para>
        <StatRow>
          <Kpi label="校本课程建设比例" value={f(dSchoolCurRate)} color={dSchoolCurRate >= citySchoolCurRate ? C.green : C.red}
            sub={`全市：${f(citySchoolCurRate)}%`} />
          <Kpi label="平均开发数量" value={f(dDevNum, 1)} unit="门/校" color={C.accent} />
          <Kpi label="动手实践类比例" value={f(dPractRate)} color={C.green}
            sub={`全市（动手实践类）：${f(CITY["校本课程建设"]["整体"]["动手实践类比例"])}%`} />
          <Kpi label="动手实践类数量" value={f(dPractNum, 1)} unit="门/校" color={C.green} />
        </StatRow>
        <Para>
          课后服务方面，本区有<b>{pct(dAfterRate)}</b>的义务教育阶段学校将科学教育作为课后服务必备选项，
          全市平均水平为{pct(cityAfterRate)}，
          {dAfterRate >= cityAfterRate
            ? <span>高于全市平均水平，领先{(dAfterRate - cityAfterRate).toFixed(2)}个百分点。</span>
            : <span>低于全市平均水平，差距{(cityAfterRate - dAfterRate).toFixed(2)}个百分点。</span>
          }
        </Para>
        <StatRow>
          <Kpi label="课后服务纳入科学教育比例" value={f(dAfterRate)}
            color={dAfterRate >= cityAfterRate ? C.green : C.red}
            sub={`全市：${f(cityAfterRate)}%`} />
        </StatRow>
      </SubSub>
    </Sub>
  );
}

// ── Section 2: 师资建设 ──────────────────────────────────────────────────────
function SecTeachers({d}) {
  const grades = ["小学", "初中", "高中"];
  const cityGradeRate = g => CITY["专职教师"]["按学段"][g];
  const bg = d["教师专业背景"];
  const cityBg = CITY["教师专业背景"];
  const vp = d["科学副校长"]["配备率"];
  const cityVp = CITY["科学副校长"]["配备率"];
  const tc = d["科技辅导员"]["配备率"];
  const cityTc = CITY["科技辅导员"]["配备率"];

  const totalTeachers = (d["教师人数"]["小学"] || 0) + (d["教师人数"]["初中"] || 0) + (d["教师人数"]["高中"] || 0);

  return (
    <Sub id="sub-1-2" title="（二）师资建设">
      <SubSub id="subsub-1-2-1" num="1" title="师资规模">
        <Para>
          2024—2025学年，{d["名称"]}中小学科学类课程教师共<b>{totalTeachers}</b>人，
          其中小学{d["教师人数"]["小学"]}人、初中{d["教师人数"]["初中"]}人、高中{d["教师人数"]["高中"]}人。
          各学段专职教师占比情况如下表所示。
        </Para>
        <DataTable
          caption={`表5  ${d["名称"]}中小学科学类课程教师人数及专职率`}
          headers={["学段", "教师人数（人）", "本区专职率（%）", "全市专职率（%）", "差距"]}
          rows={grades.map(g => [
            g,
            d["教师人数"][g] ?? "—",
            pct(d["专职率"][g]),
            pct(cityGradeRate(g)),
            <span key={g} style={{color: (d["专职率"][g] || 0) >= cityGradeRate(g) ? C.green : C.red, fontWeight: 600}}>
              {absDiffPp(d["专职率"][g], cityGradeRate(g))}
            </span>,
          ])}
        />
        <ChartCard title={`图5  ${d["名称"]}与全市各学段科学教师专职率对比（%）`}>
          <ReactECharts
            option={barOpt({
              categories: grades,
              series: [
                {name: "本区", data: grades.map(g => d["专职率"][g] || 0), color: C.accent},
                {name: "全市", data: grades.map(g => cityGradeRate(g) || 0), color: "#94a3b8"},
              ],
            })}
            style={{height: 210}}
            opts={{renderer: "svg"}}
          />
        </ChartCard>
      </SubSub>

      <SubSub id="subsub-1-2-2" num="2" title="专业背景">
        <Para>
          {d["名称"]}科学类课程教师中，具有理工科专业背景的教师占比为<b>{pct(bg["理工科背景占比"])}</b>，
          全市平均水平为{pct(cityBg["理工科背景占比"])}，
          {bg["理工科背景占比"] >= cityBg["理工科背景占比"]
            ? <span>高于全市平均水平，领先{(bg["理工科背景占比"] - cityBg["理工科背景占比"]).toFixed(2)}个百分点；</span>
            : <span>低于全市平均水平，差距{(cityBg["理工科背景占比"] - bg["理工科背景占比"]).toFixed(2)}个百分点；</span>
          }
          具有理工类硕士及以上学历的教师占比为<b>{pct(bg["理工类硕士占比"])}</b>，
          全市平均水平为{pct(cityBg["理工类硕士占比"])}；
          小学满足&ldquo;至少1名理工类硕士学位科学教师&rdquo;要求的学校占比为<b>{pct(bg["小学满足硕士要求占比"])}</b>，
          全市平均水平为{pct(cityBg["小学满足硕士要求占比"])}。
        </Para>
        <StatRow>
          <Kpi label="理工科背景占比" value={f(bg["理工科背景占比"])}
            color={bg["理工科背景占比"] >= cityBg["理工科背景占比"] ? C.green : C.red}
            sub={`全市：${f(cityBg["理工科背景占比"])}%`} />
          <Kpi label="理工类硕士占比" value={f(bg["理工类硕士占比"])}
            color={bg["理工类硕士占比"] >= cityBg["理工类硕士占比"] ? C.green : C.red}
            sub={`全市：${f(cityBg["理工类硕士占比"])}%`} />
          <Kpi label="小学满足硕士要求学校占比" value={f(bg["小学满足硕士要求占比"])}
            color={bg["小学满足硕士要求占比"] >= cityBg["小学满足硕士要求占比"] ? C.green : C.red}
            sub={`全市：${f(cityBg["小学满足硕士要求占比"])}%`} />
        </StatRow>
        <DataTable
          caption={`表6  ${d["名称"]}与全市科学类课程教师专业学历结构对比`}
          headers={["单位", "理工科背景占比（%）", "理工类硕士占比（%）", "小学满足硕士要求占比（%）"]}
          rows={[
            ["全市平均", pct(cityBg["理工科背景占比"]), pct(cityBg["理工类硕士占比"]), pct(cityBg["小学满足硕士要求占比"])],
            [d["名称"],
              <CmpCell key="a" val={bg["理工科背景占比"]} refVal={cityBg["理工科背景占比"]} />,
              <CmpCell key="b" val={bg["理工类硕士占比"]} refVal={cityBg["理工类硕士占比"]} />,
              <CmpCell key="c" val={bg["小学满足硕士要求占比"]} refVal={cityBg["小学满足硕士要求占比"]} />,
            ],
          ]}
        />
      </SubSub>

      <SubSub id="subsub-1-2-3" num="3" title="科学副校长与科技辅导员">
        <Para>
          {d["名称"]}科学副校长配备率为<b>{pct(vp)}</b>，
          全市平均水平为{pct(cityVp)}，
          {vp >= cityVp
            ? <span>高于全市平均水平，领先{(vp - cityVp).toFixed(2)}个百分点。</span>
            : <span>低于全市平均水平，差距{(cityVp - vp).toFixed(2)}个百分点。</span>
          }
          全市科学副校长中，由校级领导兼任的占比为{pct(CITY["科学副校长"]["校级领导兼任比例"])}，
          外聘比例为{pct(CITY["科学副校长"]["外聘比例"])}。
        </Para>
        <Para>
          {d["名称"]}科技辅导员配备率为<b>{pct(tc)}</b>，
          全市平均水平为{pct(cityTc)}，
          {tc >= cityTc
            ? <span>高于全市平均水平，领先{(tc - cityTc).toFixed(2)}个百分点。</span>
            : <span>低于全市平均水平，差距{(cityTc - tc).toFixed(2)}个百分点。</span>
          }
          全市平均每校配备科技辅导员{f(CITY["科技辅导员"]["校均人数"], 1)}人。
        </Para>
        <StatRow>
          <Kpi label="科学副校长配备率" value={f(vp)}
            color={vp >= cityVp ? C.green : C.red}
            sub={`全市：${f(cityVp)}%`} />
          <Kpi label="科技辅导员配备率" value={f(tc)}
            color={tc >= cityTc ? C.green : C.red}
            sub={`全市：${f(cityTc)}%`} />
        </StatRow>
        <DataTable
          caption={`表7  ${d["名称"]}与全市科学副校长及科技辅导员配备情况对比`}
          headers={["单位", "科学副校长配备率（%）", "科技辅导员配备率（%）"]}
          rows={[
            ["全市平均", pct(cityVp), pct(cityTc)],
            [d["名称"],
              <CmpCell key="vp" val={vp} refVal={cityVp} />,
              <CmpCell key="tc" val={tc} refVal={cityTc} />,
            ],
          ]}
        />
      </SubSub>
    </Sub>
  );
}

// ── Section 3: 资源设备 ──────────────────────────────────────────────────────
function SecResources({d}) {
  const grades = ["小学", "初中", "高中"];

  const labRooms = d["实验室建设"]["实验室间数达标率"];
  const labArea = d["实验室建设"]["生均使用面积达标率"];
  const cityLabRoomsGrade = g => CITY["实验室建设"]["按学段"][g]["实验室间数达标率"];
  const cityLabAreaGrade = g => CITY["实验室建设"]["按学段"][g]["生均使用面积达标率"];
  const cityLabRoomsTotal = CITY["实验室建设"]["整体"]["实验室间数达标率"];
  const cityLabAreaTotal = CITY["实验室建设"]["整体"]["生均使用面积达标率"];

  const inst = d["实验仪器达标"];
  const cityInst = CITY["实验仪器达标"];

  const equip = d["实验器材更新"];
  const equipKeys = ["每年更新", "不定期更新", "近三年未更新", "从未更新"];
  const equipClrs = [C.green, C.accent, C.orange, C.red];
  const cityEquip = CITY["实验器材更新"]["整体"];

  return (
    <Sub id="sub-1-3" title="（三）资源设备">
      <SubSub id="subsub-1-3-1" num="1" title="实验室建设">
        <Para>
          根据《义务教育学校实验室装备规范》（JY/T0385-2006），{d["名称"]}中小学实验室间数达标率整体为
          <b>{pct(labRooms["整体"] || 0)}</b>，
          全市平均水平为{pct(cityLabRoomsTotal)}，
          {(labRooms["整体"] || 0) >= cityLabRoomsTotal
            ? <span>高于全市平均水平，领先{((labRooms["整体"] || 0) - cityLabRoomsTotal).toFixed(2)}个百分点；</span>
            : <span>低于全市平均水平，差距{(cityLabRoomsTotal - (labRooms["整体"] || 0)).toFixed(2)}个百分点；</span>
          }
          生均实验室使用面积达标率整体为<b>{pct(labArea["整体"] || 0)}</b>，
          全市平均水平为{pct(cityLabAreaTotal)}，
          {(labArea["整体"] || 0) >= cityLabAreaTotal
            ? <span>高于全市平均水平，领先{((labArea["整体"] || 0) - cityLabAreaTotal).toFixed(2)}个百分点。</span>
            : <span>低于全市平均水平，差距{(cityLabAreaTotal - (labArea["整体"] || 0)).toFixed(2)}个百分点。</span>
          }
        </Para>
        <DataTable
          caption={`表8  ${d["名称"]}与全市实验室建设达标情况对比（%）`}
          headers={["学段", "间数达标率（本区）", "间数达标率（全市）", "面积达标率（本区）", "面积达标率（全市）"]}
          rows={[
            ["整体",
              <CmpCell key="ro" val={labRooms["整体"] || 0} refVal={cityLabRoomsTotal} />,
              pct(cityLabRoomsTotal),
              <CmpCell key="ao" val={labArea["整体"] || 0} refVal={cityLabAreaTotal} />,
              pct(cityLabAreaTotal)],
            ...grades.map(g => [
              g,
              <CmpCell key={`r${g}`} val={labRooms[g] || 0} refVal={cityLabRoomsGrade(g)} />,
              pct(cityLabRoomsGrade(g)),
              <CmpCell key={`a${g}`} val={labArea[g] || 0} refVal={cityLabAreaGrade(g)} />,
              pct(cityLabAreaGrade(g)),
            ]),
          ]}
        />
        <ChartCard title={`图6  ${d["名称"]}与全市实验室建设达标率对比（%）`}>
          <ReactECharts
            option={barOpt({
              categories: ["整体", ...grades],
              series: [
                {name: "间数达标（本区）", data: ["整体", ...grades].map(g => (labRooms[g] || 0)), color: C.accent},
                {name: "面积达标（本区）", data: ["整体", ...grades].map(g => (labArea[g] || 0)), color: C.green},
                {name: "间数达标（全市）", data: [cityLabRoomsTotal, ...grades.map(g => cityLabRoomsGrade(g))], color: "#93c5fd"},
                {name: "面积达标（全市）", data: [cityLabAreaTotal, ...grades.map(g => cityLabAreaGrade(g))], color: "#86efac"},
              ],
              grid: {top: 30, bottom: 38, left: 6, right: 36, containLabel: true},
            })}
            style={{height: 240}}
            opts={{renderer: "svg"}}
          />
        </ChartCard>
      </SubSub>

      <SubSub id="subsub-1-3-2" num="2" title="实验仪器配备">
        <Para>
          {d["名称"]}中小学实验仪器配备达标率：小学为<b>{pct(inst["小学"])}</b>（全市{pct(cityInst["小学"])}），
          初中为<b>{pct(inst["初中"])}</b>（全市{pct(cityInst["初中"])}），
          高中为<b>{pct(inst["高中"])}</b>（全市{pct(cityInst["高中"])}）。
        </Para>
        <DataTable
          caption={`表9  ${d["名称"]}与全市实验仪器配备达标率对比（%）`}
          headers={["学段", "本区达标率（%）", "全市达标率（%）", "差距"]}
          rows={grades.map(g => [
            g,
            pct(inst[g]),
            pct(cityInst[g]),
            <span key={g} style={{color: (inst[g] || 0) >= (cityInst[g] || 0) ? C.green : C.red, fontWeight: 600}}>
              {absDiffPp(inst[g], cityInst[g])}
            </span>,
          ])}
        />
        <Para>
          实验室器材更新方面，{d["名称"]}中小学中，
          每年定期更新的学校占<b>{pct(equip["每年更新"])}</b>，
          不定期更新的占<b>{pct(equip["不定期更新"])}</b>，
          近三年未更新的占<b>{pct(equip["近三年未更新"])}</b>，
          从未更新的占<b>{pct(equip["从未更新"])}</b>。
          全市平均每年定期更新比例为{pct(cityEquip["每年更新"])}，
          从未更新比例为{pct(cityEquip["从未更新"])}。
        </Para>
        <div style={{display: "flex", gap: 14, pageBreakInside: "avoid", breakInside: "avoid"}}>
          <ChartCard title={`图7  ${d["名称"]}实验器材更新情况（%）`} style={{flex: 1}}>
            <ReactECharts
              option={pieOpt({data: equipKeys.map((k, i) => ({name: k, value: equip[k] || 0, color: equipClrs[i]}))})}
              style={{height: 190}}
              opts={{renderer: "svg"}}
            />
          </ChartCard>
          <ChartCard title="图8  实验器材更新情况对比（本区 vs 全市）" style={{flex: 1.3}}>
            <ReactECharts
              option={barOpt({
                categories: equipKeys,
                series: [
                  {name: "本区", data: equipKeys.map(k => equip[k] || 0), color: C.accent},
                  {name: "全市", data: equipKeys.map(k => cityEquip[k] || 0), color: "#94a3b8"},
                ],
              })}
              style={{height: 190}}
              opts={{renderer: "svg"}}
            />
          </ChartCard>
        </div>
      </SubSub>
    </Sub>
  );
}

// ── Section 4: 社会协同 ──────────────────────────────────────────────────────
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
    <Sub id="sub-1-4" title="（四）社会协同">
      <SubSub id="subsub-1-4-1" num="1" title="机构结对">
        <Para>
          2025年，{d["名称"]}校外科技教育机构与学校结对比例为<b>{pct(pair["结对比例"])}</b>，
          全市平均水平为{pct(cityPair["结对比例"])}，
          {(pair["结对比例"] || 0) >= cityPair["结对比例"]
            ? <span>高于全市平均水平，领先{(pair["结对比例"] - cityPair["结对比例"]).toFixed(2)}个百分点；</span>
            : <span>低于全市平均水平，差距{(cityPair["结对比例"] - pair["结对比例"]).toFixed(2)}个百分点；</span>
          }
          平均结对个数为<b>{f(pair["结对个数"], 1)}</b>个（全市平均{f(cityPair["结对个数"], 1)}个）；
          免费结对比例为<b>{pct(pair["免费结对比例"])}</b>，
          平均免费结对个数为<b>{f(pair["免费结对个数"], 1)}</b>个。
        </Para>
        <StatRow>
          <Kpi label="结对比例" value={f(pair["结对比例"])}
            color={(pair["结对比例"] || 0) >= cityPair["结对比例"] ? C.green : C.red}
            sub={`全市：${f(cityPair["结对比例"])}%`} />
          <Kpi label="平均结对个数" value={f(pair["结对个数"], 1)} unit="个" color={C.green}
            sub={`全市：${f(cityPair["结对个数"], 1)}个`} />
          <Kpi label="免费结对比例" value={f(pair["免费结对比例"])} color={C.orange} />
          <Kpi label="免费结对个数" value={f(pair["免费结对个数"], 1)} unit="个" color={C.orange} />
        </StatRow>
        <DataTable
          caption={`表10  ${d["名称"]}与全市机构结对情况对比`}
          headers={["单位", "结对比例（%）", "平均结对个数（个）", "免费结对比例（%）", "免费结对个数（个）"]}
          rows={[
            ["全市平均", pct(cityPair["结对比例"]), f(cityPair["结对个数"], 1), "—", "—"],
            [d["名称"],
              <CmpCell key="pr" val={pair["结对比例"]} refVal={cityPair["结对比例"]} />,
              f(pair["结对个数"], 1),
              pct(pair["免费结对比例"]),
              f(pair["免费结对个数"], 1)],
          ]}
        />
      </SubSub>

      <SubSub id="subsub-1-4-2" num="2" title="科学实践活动">
        <Para>
          2025年，{d["名称"]}积极开展&ldquo;请进来&rdquo;和&ldquo;走出去&rdquo;科学实践活动。
          全市共有<b>{pct(CITY["请进来活动"]["比例"])}</b>（{CITY["请进来活动"]["学校数"]}所）的中小学开展了&ldquo;请进来&rdquo;科学实践活动；
          <b>{pct(CITY["走出去活动"]["比例"])}</b>（{CITY["走出去活动"]["学校数"]}所）的中小学开展了&ldquo;走出去&rdquo;科学实践活动。
          各类活动参与情况如下：
        </Para>
        <ChartCard title={`图9  ${d["名称"]}"请进来"活动参与率对比（本区 vs 全市，%）`}>
          <ReactECharts
            option={barOpt({
              categories: jinlaiKeys,
              horizontal: true,
              series: [
                {name: "本区", data: jinlaiKeys.map(k => jinlai[k] || 0), color: C.accent},
                {name: "全市", data: jinlaiKeys.map(k => cityJinlai[k] || 0), color: "#94a3b8"},
              ],
              grid: {top: 8, bottom: 30, left: 6, right: 44, containLabel: true},
            })}
            style={{height: Math.max(160, jinlaiKeys.length * 34 + 50)}}
            opts={{renderer: "svg"}}
          />
        </ChartCard>
        <DataTable
          caption={`表11  ${d["名称"]}与全市"请进来"活动参与率对比（%）`}
          headers={["活动类型", "本区（%）", "全市（%）", "差距"]}
          rows={jinlaiKeys.map(k => [
            k,
            pct(jinlai[k]),
            pct(cityJinlai[k]),
            <span key={k} style={{color: (jinlai[k] || 0) >= (cityJinlai[k] || 0) ? C.green : C.red, fontWeight: 600}}>
              {absDiffPp(jinlai[k], cityJinlai[k])}
            </span>,
          ])}
        />
        <ChartCard title={`图10  ${d["名称"]}"走出去"活动参与率对比（本区 vs 全市，%）`}>
          <ReactECharts
            option={barOpt({
              categories: zhuquKeys,
              horizontal: true,
              series: [
                {name: "本区", data: zhuquKeys.map(k => zhuqu[k] || 0), color: C.green},
                {name: "全市", data: zhuquKeys.map(k => cityZhuqu[k] || 0), color: "#94a3b8"},
              ],
              grid: {top: 8, bottom: 30, left: 6, right: 44, containLabel: true},
            })}
            style={{height: Math.max(130, zhuquKeys.length * 42 + 50)}}
            opts={{renderer: "svg"}}
          />
        </ChartCard>
        <DataTable
          caption={`表12  ${d["名称"]}与全市"走出去"活动参与率对比（%）`}
          headers={["活动类型", "本区（%）", "全市（%）", "差距"]}
          rows={zhuquKeys.map(k => [
            k,
            pct(zhuqu[k]),
            pct(cityZhuqu[k]),
            <span key={k} style={{color: (zhuqu[k] || 0) >= (cityZhuqu[k] || 0) ? C.green : C.red, fontWeight: 600}}>
              {absDiffPp(zhuqu[k], cityZhuqu[k])}
            </span>,
          ])}
        />
      </SubSub>
    </Sub>
  );
}

// ── Section 5: 重点关注方面 ───────────────────────────────────────────────────
function SecIssues({d}) {
  // Build comparison checks for district vs city
  const checks = [
    {label: "义务教育学校科学类课程课时达标率", val: d["课程落实"]["达标率"], cityVal: CITY["课程落实"]["达标率"], threshold: CITY["主要问题"]?.find(p => p["问题"].includes("课程课时"))?.["比例"]},
    {label: "课后服务纳入科学教育比例", val: d["课后服务"]["比例"], cityVal: CITY["课后服务"]["比例"]},
    {label: "科学副校长配备率", val: d["科学副校长"]["配备率"], cityVal: CITY["科学副校长"]["配备率"]},
    {label: "科技辅导员配备率", val: d["科技辅导员"]["配备率"], cityVal: CITY["科技辅导员"]["配备率"]},
    {label: "理工科背景教师占比", val: d["教师专业背景"]["理工科背景占比"], cityVal: CITY["教师专业背景"]["理工科背景占比"]},
    {label: "理工类硕士教师占比", val: d["教师专业背景"]["理工类硕士占比"], cityVal: CITY["教师专业背景"]["理工类硕士占比"]},
    {label: "小学满足硕士要求学校占比", val: d["教师专业背景"]["小学满足硕士要求占比"], cityVal: CITY["教师专业背景"]["小学满足硕士要求占比"]},
    {label: "实验室间数达标率", val: d["实验室建设"]["实验室间数达标率"]["整体"] || 0, cityVal: CITY["实验室建设"]["整体"]["实验室间数达标率"]},
    {label: "生均实验室面积达标率", val: d["实验室建设"]["生均使用面积达标率"]["整体"] || 0, cityVal: CITY["实验室建设"]["整体"]["生均使用面积达标率"]},
    {label: "校本课程建设比例", val: d["校本课程建设"]["建设比例"], cityVal: CITY["校本课程建设"]["整体"]["建设比例"]},
    {label: "机构结对比例", val: d["机构结对"]["结对比例"], cityVal: CITY["机构结对"]["整体"]["结对比例"]},
  ];

  const below = checks.filter(c => (c.val || 0) < c.cityVal);
  const above = checks.filter(c => (c.val || 0) >= c.cityVal);

  // Ranking
  function rank(getVal) {
    const sorted = [...DISTRICTS_DATA].sort((a, b) => getVal(b) - getVal(a));
    return sorted.findIndex(x => x["名称"] === d["名称"]) + 1;
  }

  const rankRows = [
    {key: "课程达标率", get: x => x["课程落实"]["达标率"], cityGet: () => CITY["课程落实"]["达标率"]},
    {key: "课后服务比例", get: x => x["课后服务"]["比例"], cityGet: () => CITY["课后服务"]["比例"]},
    {key: "科学副校长配备率", get: x => x["科学副校长"]["配备率"], cityGet: () => CITY["科学副校长"]["配备率"]},
    {key: "机构结对比例", get: x => x["机构结对"]["结对比例"], cityGet: () => CITY["机构结对"]["整体"]["结对比例"]},
    {key: "理工科背景占比", get: x => x["教师专业背景"]["理工科背景占比"], cityGet: () => CITY["教师专业背景"]["理工科背景占比"]},
    {key: "实验室间数达标率", get: x => x["实验室建设"]["实验室间数达标率"]["整体"] || 0, cityGet: () => CITY["实验室建设"]["整体"]["实验室间数达标率"]},
    {key: "生均面积达标率", get: x => x["实验室建设"]["生均使用面积达标率"]["整体"] || 0, cityGet: () => CITY["实验室建设"]["整体"]["生均使用面积达标率"]},
  ].map(m => {
    const r = rank(m.get);
    const n = DISTRICTS_DATA.length;
    const tier = r <= 3 ? "前三名" : r <= Math.ceil(n / 3) ? "上游" : r <= Math.ceil(n * 2 / 3) ? "中游" : "有待提升";
    const tierColor = r <= 3 ? C.green : r <= Math.ceil(n / 3) ? "#16a34a" : r <= Math.ceil(n * 2 / 3) ? C.accent : C.red;
    return [
      m.key,
      pct(m.get(d)),
      pct(m.cityGet()),
      `第${r}名 / 共${n}个区`,
      <span key={m.key} style={{color: tierColor, fontWeight: 700}}>{tier}</span>,
    ];
  });

  // City-level main issues
  const cityIssues = CITY["主要问题"] || [];

  return (
    <Section id="sec-2" num="二、" title="重点关注方面">
      <Sub id="sub-2-1" title="（一）主要结论">
        <Para>
          根据{META["报告日期"]}调查结果，{d["名称"]}在中小学科学教育工作中取得积极进展，
          但仍存在以下需重点关注的问题：
        </Para>
        {below.length === 0 ? (
          <div style={{
            background: C.greenLight, border: `1px solid ${C.green}`,
            borderRadius: 8, padding: "14px 18px",
            fontSize: 13, color: "#166534", fontWeight: 600,
          }}>
            {d["名称"]}在所有监测指标中均达到或超过全市平均水平，总体表现优秀。
          </div>
        ) : (
          <div style={{marginBottom: 14}}>
            {below.map((c, i) => (
              <div key={c.label} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                marginBottom: 10, padding: "10px 14px",
                background: i === 0 ? C.redLight : "#fff",
                borderRadius: 6,
                borderLeft: `4px solid ${i === 0 ? C.red : C.border}`,
                border: `1px solid ${i === 0 ? "#fecaca" : C.border}`,
              }}>
                <span style={{fontSize: 13, fontWeight: 800, color: i < 3 ? C.red : C.orange, minWidth: 20}}>
                  {["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"][i]}
                </span>
                <div>
                  <span style={{fontWeight: 700, color: C.text, fontSize: 13}}>{c.label}</span>
                  <div style={{fontSize: 12, color: C.muted, marginTop: 3}}>
                    本区 <b style={{color: C.red}}>{pct(c.val)}</b>
                    {" · "}全市 <b>{pct(c.cityVal)}</b>
                    {" · "}差距 <b style={{color: C.red}}>{Math.abs(c.val - c.cityVal).toFixed(2)}pp</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {cityIssues.length > 0 && (
          <>
            <Para>全市层面，中小学科学教育工作存在以下主要问题（供参考）：</Para>
            {cityIssues.map((issue, i) => (
              <div key={i} style={{
                padding: "8px 14px", marginBottom: 8,
                background: C.grayLight, borderRadius: 6,
                borderLeft: `4px solid ${C.border}`,
                fontSize: 12, color: C.text,
              }}>
                <span style={{fontWeight: 700, color: C.primary, marginRight: 6}}>{i + 1}.</span>
                {issue["问题"]}
                {issue["比例"] !== undefined && (
                  <span style={{color: C.red, marginLeft: 6, fontWeight: 600}}>（{pct(issue["比例"])}）</span>
                )}
                {issue["按学段"] && (
                  <span style={{color: C.muted, marginLeft: 6, fontSize: 11}}>
                    小学：{pct(issue["按学段"]["小学"])}；初中：{pct(issue["按学段"]["初中"])}；高中：{pct(issue["按学段"]["高中"])}
                  </span>
                )}
              </div>
            ))}
          </>
        )}
      </Sub>

      <Sub id="sub-2-2" title="（二）与全市平均水平对比分析">
        {below.length > 0 && (
          <>
            <div style={{fontWeight: 700, color: C.red, margin: "0 0 8px", fontSize: 13}}>
              低于全市平均水平的指标（{below.length}项）
            </div>
            <DataTable
              headers={["指标", `${d["名称"]}`, "全市平均", "差距"]}
              rows={below.map((c, i) => [
                c.label,
                pct(c.val),
                pct(c.cityVal),
                <span key={i} style={{color: C.red, fontWeight: 600}}>
                  {absDiffPp(c.val, c.cityVal)}
                </span>,
              ])}
            />
          </>
        )}
        {above.length > 0 && (
          <>
            <div style={{fontWeight: 700, color: C.green, margin: "16px 0 8px", fontSize: 13}}>
              达到或高于全市平均水平的指标（{above.length}项）
            </div>
            <DataTable
              headers={["指标", `${d["名称"]}`, "全市平均", "领先幅度"]}
              rows={above.map((c, i) => [
                c.label,
                pct(c.val),
                pct(c.cityVal),
                <span key={i} style={{color: (c.val - c.cityVal) > 0 ? C.green : C.gray, fontWeight: 600}}>
                  {absDiffPp(c.val, c.cityVal)}
                </span>,
              ])}
            />
          </>
        )}
      </Sub>

      <Sub id="sub-2-3" title="（三）全市区县排名情况">
        <Para>下表为{d["名称"]}在全市各区县主要指标中的排名情况：</Para>
        <DataTable
          headers={["指标", "本区数值", "全市平均", "全市排名", "评级"]}
          rows={rankRows}
        />
      </Sub>

      {CITY["低于全国平均事项"] && CITY["低于全国平均事项"].length > 0 && (
        <Sub id="sub-2-4" title="（四）全市低于全国平均水平事项">
          <Para>以下为全市层面低于全国平均水平的事项，需引起重视：</Para>
          {CITY["低于全国平均事项"].map((item, i) => (
            <div key={i} style={{
              padding: "8px 14px", marginBottom: 8,
              background: C.orangeLight, borderRadius: 6,
              borderLeft: `4px solid ${C.orange}`,
              fontSize: 12, color: C.text, fontWeight: 500,
            }}>
              <span style={{color: C.orange, fontWeight: 700, marginRight: 6}}>{i + 1}.</span>
              {item}
            </div>
          ))}
        </Sub>
      )}

      <Sub id="sub-2-5" title="（五）组织保障情况">
        <Para>
          2025年，全市层面，{pct(CITY["组织保障"]["部门统筹机制建立比例"])}的区县已建立部门统筹协调科学教育抓落实的工作机制，
          较2024年（{pct(CITY["组织保障"]["部门统筹机制建立比例"] - CITY["组织保障"]["部门统筹同比变化"])}）
          提高了{f(CITY["组织保障"]["部门统筹同比变化"])}个百分点；
          {pct(CITY["组织保障"]["实施方案制定比例"])}的区县制定了科学教育工作推进实施方案，
          较2024年提高了{f(CITY["组织保障"]["实施方案同比变化"])}个百分点。
        </Para>
        <Para>
          全市科学教育省级财政经费投入共<b>{f(CITY["经费投入"]["省级总投入万元"], 1)}</b>万元，
          其中仪器购置经费约{f(CITY["经费投入"]["仪器购置经费万元"], 1)}万元，
          教师培训经费约{f(CITY["经费投入"]["教师培训经费万元"], 1)}万元，
          科技活动经费约{f(CITY["经费投入"]["科技活动经费万元"], 1)}万元，
          较上年（{f(CITY["经费投入"]["去年总投入万元"], 1)}万元）增加了{f(CITY["经费投入"]["同比增加万元"], 1)}万元。
          {pct(CITY["组织保障"]["区县投入经费比例"])}的区县投入了科学教育经费。
        </Para>
        <StatRow>
          <Kpi label="全市科学教育总经费投入" value={f(CITY["经费投入"]["省级总投入万元"], 0)} unit="万元" color={C.accent} />
          <Kpi label="仪器购置经费" value={f(CITY["经费投入"]["仪器购置经费万元"], 0)} unit="万元" color={C.green} />
          <Kpi label="教师培训经费" value={f(CITY["经费投入"]["教师培训经费万元"], 0)} unit="万元" color={C.orange} />
          <Kpi label="科技活动经费" value={f(CITY["经费投入"]["科技活动经费万元"], 0)} unit="万元" color={C.primary} />
        </StatRow>
      </Sub>
    </Section>
  );
}

// ── Nav Sidebar ───────────────────────────────────────────────────────────────
const NAV_TOC = [
  {
    id: "sec-1",
    title: "一、工作基本情况",
    subs: [
      {id: "sub-1-1", label: "（一）课程教学", subsubs: [
        {id: "subsub-1-1-1", label: "1. 课程落实"},
        {id: "subsub-1-1-2", label: "2. 实验教学"},
        {id: "subsub-1-1-3", label: "3. 课程建设"},
      ]},
      {id: "sub-1-2", label: "（二）师资建设", subsubs: [
        {id: "subsub-1-2-1", label: "1. 师资规模"},
        {id: "subsub-1-2-2", label: "2. 专业背景"},
        {id: "subsub-1-2-3", label: "3. 科学副校长与科技辅导员"},
      ]},
      {id: "sub-1-3", label: "（三）资源设备", subsubs: [
        {id: "subsub-1-3-1", label: "1. 实验室建设"},
        {id: "subsub-1-3-2", label: "2. 实验仪器配备"},
      ]},
      {id: "sub-1-4", label: "（四）社会协同", subsubs: [
        {id: "subsub-1-4-1", label: "1. 机构结对"},
        {id: "subsub-1-4-2", label: "2. 科学实践活动"},
      ]},
    ],
  },
  {
    id: "sec-2",
    title: "二、重点关注方面",
    subs: [
      {id: "sub-2-1", label: "（一）主要结论"},
      {id: "sub-2-2", label: "（二）与全市平均水平对比分析"},
      {id: "sub-2-3", label: "（三）全市区县排名情况"},
      {id: "sub-2-4", label: "（四）全市低于全国平均水平事项"},
      {id: "sub-2-5", label: "（五）组织保障情况"},
    ],
  },
];

// Top navbar height in ManagementPage is 52px; add 16px breathing room
const NAV_OFFSET = 52 + 16;

function NavSidebar() {
  const [activeId, setActiveId] = React.useState(null);

  // Collect all trackable IDs: subsubs first (most specific), then subs
  const allTrackedIds = React.useMemo(() => {
    const ids = [];
    NAV_TOC.forEach(({subs}) => {
      subs.forEach(s => {
        if (s.subsubs) {s.subsubs.forEach(ss => ids.push(ss.id));}
        ids.push(s.id);
      });
    });
    return ids;
  }, []);

  React.useEffect(() => {
    const observers = [];
    const visibleSet = new Set();

    const update = () => {
      for (const id of allTrackedIds) {
        if (visibleSet.has(id)) {
          setActiveId(id);
          return;
        }
      }
    };

    allTrackedIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) {return;}
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {visibleSet.add(id);} else {visibleSet.delete(id);}
          update();
        },
        {rootMargin: `-${NAV_OFFSET}px 0px -50% 0px`});
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [allTrackedIds]);

  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (!el) {return;}
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({top, behavior: "instant"});
  };

  const inner = (
    <div style={{
      width: 210,
      maxHeight: `calc(100vh - ${NAV_OFFSET + 8}px)`,
      overflowY: "auto",
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      border: `1px solid ${C.border}`,
      padding: "14px 0 14px",
    }}>
      <div style={{
        fontSize: 12, fontWeight: 800, color: C.primary,
        padding: "0 14px 10px", borderBottom: `1px solid ${C.border}`,
        marginBottom: 8, letterSpacing: "0.05em",
      }}>
        目录
      </div>
      {NAV_TOC.map(({id, title, subs}) => {
        const secActive = subs.some(s =>
          s.id === activeId || (s.subsubs && s.subsubs.some(ss => ss.id === activeId))
        );
        return (
          <div key={id}>
            <div
              onClick={() => handleClick(id)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: secActive ? C.accent : C.text,
                cursor: "pointer",
                lineHeight: 1.5,
              }}
            >
              {title}
            </div>
            {subs.map(({id: subId, label, subsubs}) => {
              const hasSubsubs = subsubs && subsubs.length > 0;
              const subHasActive = hasSubsubs && subsubs.some(ss => ss.id === activeId);
              // Highlight sub only if active is sub itself (no subsub active in this sub)
              const subHighlight = activeId === subId;
              return (
                <div key={subId}>
                  <div
                    onClick={() => handleClick(subId)}
                    style={{
                      padding: "5px 14px 5px 20px",
                      cursor: "pointer",
                      borderLeft: `3px solid ${(subHighlight && !subHasActive) ? C.accent : "transparent"}`,
                      background: (subHighlight && !subHasActive) ? "#f0f7ff" : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      fontSize: 11,
                      color: (subHighlight && !subHasActive) ? C.accent : (subHasActive ? C.accent : C.muted),
                      fontWeight: (subHighlight && !subHasActive) ? 700 : (subHasActive ? 600 : 400),
                      lineHeight: 1.5,
                    }}>
                      {label}
                    </div>
                  </div>
                  {hasSubsubs && subsubs.map(({id: ssId, label: ssLabel}) => {
                    const isActive = activeId === ssId;
                    return (
                      <div
                        key={ssId}
                        onClick={() => handleClick(ssId)}
                        style={{
                          padding: "4px 14px 4px 30px",
                          cursor: "pointer",
                          borderLeft: `3px solid ${isActive ? C.accent : "transparent"}`,
                          background: isActive ? "#f0f7ff" : "transparent",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{
                          fontSize: 10,
                          color: isActive ? C.accent : "#94a3b8",
                          fontWeight: isActive ? 700 : 400,
                          lineHeight: 1.5,
                        }}>
                          {ssLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{width: 210, flexShrink: 0}}>
      <Affix offsetTop={NAV_OFFSET}>
        {inner}
      </Affix>
    </div>
  );
}

// ── Cover ─────────────────────────────────────────────────────────────────────
function Cover({d, isRaw = false}) {
  return (
    <div style={{
      background: `linear-gradient(140deg, ${C.primary} 0%, ${C.accent} 100%)`,
      color: "#fff", padding: "60px 60px 50px",
      borderRadius: isRaw ? 0 : "8px 8px 0 0",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{position: "absolute", top: -40, right: -40, width: 220, height: 220, background: "rgba(255,255,255,0.05)", borderRadius: "50%"}} />
      <div style={{position: "absolute", bottom: -30, left: -30, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%"}} />
      <div style={{position: "relative"}}>
        <div style={{display: "flex", justifyContent: "flex-end", marginBottom: 24}}>
          <span style={{fontSize: 13, letterSpacing: "0.15em", opacity: 0.8, fontWeight: 600}}>
            内部资料 &nbsp;·&nbsp; 请勿外传
          </span>
        </div>
        <div style={{fontSize: 14, opacity: 0.85, marginBottom: 10, letterSpacing: "0.08em"}}>
          2025年中小学科学教育工作诊断报告
        </div>
        <div style={{fontSize: 36, fontWeight: 900, letterSpacing: "0.1em", marginBottom: 6, lineHeight: 1.2}}>
          {d["名称"]}
        </div>
        <div style={{fontSize: 18, opacity: 0.9, letterSpacing: "0.05em", marginBottom: 4}}>
          北京市科学教育专项诊断区级报告
        </div>
        <div style={{
          marginTop: 32, paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.25)",
          display: "flex", gap: 40,
        }}>
          {[
            ["报告期", "2025年度"],
            ["发布机构", "教育部教育质量评估中心"],
            ["发布时间", `${META["报告日期"].replace("-", "年")}月`],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{fontSize: 11, opacity: 0.6, marginBottom: 5}}>{k}</div>
              <div style={{fontSize: 14, fontWeight: 600}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function DistrictReportPage({match, isRaw = false}) {
  const [downloading, setDownloading] = React.useState(false);

  const districtName = match?.params?.districtName
    ? decodeURIComponent(match.params.districtName)
    : null;

  const handleDownload = () => {
    setDownloading(true);
    fetch(`/api/download-district-report?districtName=${encodeURIComponent(districtName)}`)
      .then(res => {
        if (!res.ok) {throw new Error("下载失败");}
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${districtName}科学教育诊断报告.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(err => alert(err.message))
      .finally(() => setDownloading(false));
  };

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

  return (
    <div style={{
      background: isRaw ? "transparent" : "#f0f4f8",
      minHeight: isRaw ? undefined : "100vh",
      padding: isRaw ? 0 : "24px 0 48px",
      fontFamily: "'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif",
    }}>
      <Helmet>
        <title>
          {districtName ? `${districtName}区级报告 - 教育数据管理平台` : "区级报告 - 教育数据管理平台"}
        </title>
        {isRaw && <style>{"body { background-color: #fff !important; }"}</style>}
      </Helmet>

      {!isRaw && (
        <div style={{maxWidth: 1220, margin: "0 auto 12px", display: "flex", justifyContent: "flex-end", paddingRight: 4}}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={handleDownload}
          >
            下载PDF报告
          </Button>
        </div>
      )}

      <div style={{
        maxWidth: isRaw ? "none" : 1220,
        margin: isRaw ? 0 : "0 auto",
        display: isRaw ? "block" : "flex",
        alignItems: "flex-start",
        gap: isRaw ? 0 : 16,
      }}>
        {!isRaw && <NavSidebar />}

        <div style={{
          flex: 1,
          minWidth: 0,
          maxWidth: isRaw ? "none" : 980,
          background: "#fff",
          boxShadow: isRaw ? "none" : "0 2px 16px rgba(0,0,0,0.10)",
          borderRadius: isRaw ? 0 : 8,
        }}>
          <Cover d={d} isRaw={isRaw} />

          <div style={{padding: "44px 60px"}}>

            {/* Summary box */}
            <div style={{
              background: C.accentLight, border: `1px solid ${C.accent}`,
              borderRadius: 8, padding: "18px 22px", marginBottom: 36,
              fontSize: 13, lineHeight: 2.0, color: C.primary,
            }}>
              <div style={{fontWeight: 800, marginBottom: 8, fontSize: 15}}>报告摘要</div>
            2025年中小学科学教育工作专项诊断调查在31个省（自治区、直辖市）和新疆生产建设兵团开展。
              {META["省份"]}共有{META["区县总数"]}个区县参与了本次调查，
            共{META["学校总数"]}所学校参与填报，
            通过对本次调查结果开展全面分析，形成本报告。
              <div style={{marginTop: 10}}>
                <b>{d["名称"]}核心指标：</b>
              课程达标率 <b style={{color: d["课程落实"]["达标率"] >= CITY["课程落实"]["达标率"] ? C.green : C.red}}>
                  {pct(d["课程落实"]["达标率"])}
                </b>（全市 {pct(CITY["课程落实"]["达标率"])}）；
              科学副校长配备率 <b style={{color: d["科学副校长"]["配备率"] >= CITY["科学副校长"]["配备率"] ? C.green : C.red}}>
                  {pct(d["科学副校长"]["配备率"])}
                </b>（全市 {pct(CITY["科学副校长"]["配备率"])}）；
              机构结对比例 <b style={{color: d["机构结对"]["结对比例"] >= CITY["机构结对"]["整体"]["结对比例"] ? C.green : C.red}}>
                  {pct(d["机构结对"]["结对比例"])}
                </b>（全市 {pct(CITY["机构结对"]["整体"]["结对比例"])}）。
              </div>
            </div>

            {/* TOC */}
            <div style={{marginBottom: 40, padding: "18px 22px", background: C.grayLight, borderRadius: 8, border: `1px solid ${C.border}`}}>
              <div style={{fontWeight: 800, fontSize: 15, color: C.primary, marginBottom: 12, letterSpacing: "0.05em"}}>
              目录
              </div>
              {NAV_TOC.map(({title, subs}) => (
                <div key={title} style={{marginBottom: 10}}>
                  <div style={{fontWeight: 700, color: C.text, fontSize: 13}}>{title}</div>
                  {subs.map(({label, detail}) => (
                    <div key={label} style={{fontSize: 12, color: C.muted, paddingLeft: 22, marginTop: 3, lineHeight: 1.7}}>
                    · {label}{detail ? `：${detail}` : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Body */}
            <Section id="sec-1" num="一、" title="工作基本情况">
              <SecCourseTeaching d={d} />
              <SecTeachers d={d} />
              <SecResources d={d} />
              <SecSocial d={d} />
            </Section>

            <SecIssues d={d} />

          </div>
        </div>
      </div>

      <div id="reportEnd" />
    </div>
  );
}

export default DistrictReportPage;
