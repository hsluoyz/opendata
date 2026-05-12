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

const FONT = "\"Microsoft YaHei\", sans-serif";
const BASE = {fontFamily: FONT, fontStyle: "normal", textDecoration: "none", margin: 0};

// Style constants derived from the original document CSS
const S = {
  s1: {...BASE, color: "#0E766D", fontWeight: "bold", fontSize: "12pt"},
  s2: {...BASE, color: "#465469", fontSize: "8pt"},
  s3: {...BASE, color: "#63748A", fontSize: "9pt"},
  s4: {...BASE, color: "#0E172A", fontWeight: "bold", fontSize: "11pt"},
  s5: {...BASE, color: "#0E766D", fontWeight: "bold", fontSize: "24pt"},
  s6: {...BASE, color: "#334154", fontWeight: "bold", fontSize: "8.5pt"},
  s7: {...BASE, color: "#2462EB", fontWeight: "bold", fontSize: "24pt"},
  s8: {...BASE, color: "#D97705", fontWeight: "bold", fontSize: "24pt"},
  s9: {...BASE, color: "#0E766D", fontWeight: "bold", fontSize: "11pt"},
  s10: {...BASE, color: "#334154", fontSize: "7.5pt"},
  s11: {...BASE, color: "#2462EB", fontWeight: "bold", fontSize: "11pt"},
  s12: {...BASE, color: "#D97705", fontWeight: "bold", fontSize: "11pt"},
  s13: {...BASE, color: "#7B39EC", fontWeight: "bold", fontSize: "11pt"},
  s14: {...BASE, color: "#465469", fontSize: "9pt"},
  s15: {...BASE, color: "#334154", fontSize: "8pt"},
  s16: {...BASE, color: "#0E766D", fontWeight: "bold", fontSize: "8pt"},
  s17: {...BASE, color: "#0E172A", fontWeight: "bold", fontSize: "10pt"},
  s18: {...BASE, color: "#465469", fontSize: "7.5pt"},
  s19: {...BASE, color: "#2462EB", fontWeight: "bold", fontSize: "8pt"},
  s20: {...BASE, color: "#D97705", fontWeight: "bold", fontSize: "8pt"},
  s21: {...BASE, color: "#7B39EC", fontWeight: "bold", fontSize: "8pt"},
  s22: {...BASE, color: "#0891B1", fontWeight: "bold", fontSize: "8pt"},
  s23: {...BASE, color: "#BD123B", fontWeight: "bold", fontSize: "8pt"},
  s24: {...BASE, color: "#FFF", fontWeight: "bold", fontSize: "8pt"},
  s25: {...BASE, color: "#0E172A", fontWeight: "bold", fontSize: "7pt"},
  s26: {...BASE, color: "#0E172A", fontSize: "7pt"},
  s27: {...BASE, color: "#465469", fontSize: "7pt"},
  s28: {...BASE, color: "#0E766D", fontWeight: "bold", fontSize: "9pt"},
  s29: {...BASE, color: "#334154", fontSize: "7pt"},
  s30: {...BASE, color: "#2462EB", fontWeight: "bold", fontSize: "9pt"},
  s31: {...BASE, color: "#7B39EC", fontWeight: "bold", fontSize: "9pt"},
  s32: {...BASE, color: "#D97705", fontWeight: "bold", fontSize: "9pt"},
  h1: {...BASE, color: "#0E172A", fontWeight: "bold", fontSize: "22pt"},
  h2: {...BASE, color: "#0E172A", fontWeight: "bold", fontSize: "12pt"},
  h3: {...BASE, color: "#0E766D", fontWeight: "bold", fontSize: "11pt"},
  h4: {...BASE, color: "#0E766D", fontWeight: "bold", fontSize: "10pt"},
  p: {...BASE, color: "#334154", fontSize: "8.5pt"},
};

// Border shorthands
const B = {
  green: "1pt solid #0E766D",
  blue: "1pt solid #2462EB",
  orange: "1pt solid #D97705",
  purple: "1pt solid #7B39EC",
  cyan: "1pt solid #0891B1",
  red: "1pt solid #BD123B",
  gray: "1pt solid #CAD4E0",
  ghostW: "3pt solid #F8F9FB",
};

const tbl = {borderCollapse: "collapse"};

class HomePageNew extends React.Component {
  render() {
    return (
      <div style={{padding: 24, overflowX: "auto", fontFamily: FONT}}>

        {/* ── 封面标题区 ── */}
        <p style={{textIndent: 0, textAlign: "left"}}><br /></p>
        <p style={{...S.s1, paddingLeft: "84pt", textIndent: 0, lineHeight: "22pt", textAlign: "center"}}>评估生态体系</p>
        <p style={{...S.s2, paddingLeft: "84pt", textIndent: 0, lineHeight: "14pt", textAlign: "center"}}>诊断 · 监测 · 反馈 · 改进</p>
        <p style={{textIndent: 0, textAlign: "left"}}><br /></p>
        <p style={{...S.s1, paddingLeft: "16pt", textIndent: 0, textAlign: "left"}}>▎体系总述</p>
        <h1 style={{...S.h1, paddingTop: "1pt", paddingLeft: "84pt", textIndent: 0, lineHeight: "40pt", textAlign: "center"}}>区域科学教育发展水平评估体系</h1>
        <p style={{textIndent: 0, textAlign: "left"}}></p>
        <p style={{...S.s3, paddingLeft: "84pt", textIndent: 0, lineHeight: "15pt", textAlign: "center"}}>Regional Science Education Development Assessment Ecosystem</p>
        <h4 style={{...S.h4, paddingLeft: "84pt", textIndent: 0, lineHeight: "93%", textAlign: "center"}}>以发展框架为牵引、以年度数据监测为基础、以大数据平台为支撑、以报告反馈为闭环的区域科学教育治理支持体系</h4>
        <p style={{...S.s1, paddingTop: "6pt", paddingLeft: "84pt", textIndent: 0, textAlign: "center"}}>▎闭环生态结构</p>
        <p style={{paddingTop: "6pt", textIndent: 0, textAlign: "left"}}><br /></p>
        <p style={{...S.s4, paddingLeft: "84pt", textIndent: 0, lineHeight: "20pt", textAlign: "center"}}>北京市中小学</p>
        <p style={{...S.s4, paddingLeft: "84pt", textIndent: 0, lineHeight: "20pt", textAlign: "center"}}>科学教育研究指导中心</p>
        <p style={{...S.p, paddingLeft: "33pt", textIndent: 0, lineHeight: "14pt", textAlign: "left"}}>《区域科学教育发展水平评估生态体系》立足教育强国、科技强国和人才强国战略要求，围绕</p>
        <p style={{...S.p, paddingTop: "1pt", paddingLeft: "16pt", textIndent: 0, lineHeight: "107%", textAlign: "justify"}}>科学教育&quot;育人目标—关键要素—运行机制—治理保障&quot;的内在逻辑，构建由发展框架、年度数据监测、大数据平台、报告反馈与改进应用组成的闭环体系。体系以学生科学核心素养发展为根本，以教师专业发展、课程教学、资源配置、协同育人与治理能力为关键支撑，推动区域科学教育从经验判断走向证据治理、从阶段评估走向持续改进，为科学教育高质量发展提供可诊断、可监测、可反馈、可改进、可引领的行动坐标。</p>

        {/* ── 三级指标统计表 ── */}
        <table style={{...tbl, marginLeft: "16.7pt"}} cellSpacing={0}>
          <tbody>
            <tr style={{height: "65pt"}}>
              <td style={{width: "116pt", backgroundColor: "#EBFCF5"}}>
                <p style={{...S.s5, paddingTop: "2pt", textIndent: 0, lineHeight: "43pt", textAlign: "center"}}>6</p>
                <p style={{...S.s6, textIndent: 0, lineHeight: "15pt", textAlign: "center"}}>一级指标</p>
              </td>
              <td style={{width: "116pt", backgroundColor: "#EEF6FF"}}>
                <p style={{...S.s7, paddingTop: "2pt", textIndent: 0, lineHeight: "43pt", textAlign: "center"}}>17</p>
                <p style={{...S.s6, textIndent: 0, lineHeight: "15pt", textAlign: "center"}}>二级指标</p>
              </td>
              <td style={{width: "117pt", backgroundColor: "#FDF3C6"}}>
                <p style={{...S.s8, paddingTop: "2pt", textIndent: 0, lineHeight: "43pt", textAlign: "center"}}>88</p>
                <p style={{...S.s6, textIndent: 0, lineHeight: "15pt", textAlign: "center"}}>三级指标</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── 闭环生态结构 2×2 表 ── */}
        <table style={{...tbl, marginLeft: "-2.48pt"}} cellSpacing={0}>
          <tbody>
            <tr style={{height: "56pt"}}>
              <td style={{width: "191pt", border: B.green, backgroundColor: "#EBFCF5"}}>
                <p style={{...S.s9, paddingTop: "3pt", textIndent: 0, lineHeight: "20pt", textAlign: "center"}}>01 发展框架</p>
                <p style={{...S.s10, paddingLeft: "5pt", paddingRight: "4pt", textIndent: 0, textAlign: "center"}}>明确评价维度、指标层级与边界原则，形成区域科学教育发展的共同语言与结构坐标。</p>
              </td>
              <td style={{width: "192pt", borderTop: B.blue, borderLeft: B.green, borderBottom: B.blue, borderRight: B.blue, backgroundColor: "#EEF6FF"}}>
                <p style={{...S.s11, paddingTop: "3pt", textIndent: 0, lineHeight: "20pt", textAlign: "center"}}>02 年度数据监测</p>
                <p style={{...S.s10, paddingLeft: "9pt", paddingRight: "8pt", textIndent: 0, textAlign: "center"}}>围绕三级指标开展年度数据采集、质量校验与趋势跟踪，形成连续、可比、可追踪的证据基础。</p>
              </td>
            </tr>
            <tr style={{height: "56pt"}}>
              <td style={{width: "191pt", borderTop: B.green, borderLeft: B.orange, borderBottom: B.orange, borderRight: B.orange, backgroundColor: "#FDF3C6"}}>
                <p style={{...S.s12, paddingTop: "3pt", textIndent: 0, lineHeight: "20pt", textAlign: "center"}}>04 报告反馈应用</p>
                <p style={{...S.s10, paddingLeft: "5pt", paddingRight: "4pt", textIndent: 0, textAlign: "center"}}>生成区域诊断报告、学校反馈报告与治理建议清单，推动政策优化、资源调配和实践改进。</p>
              </td>
              <td style={{width: "192pt", borderTop: B.blue, borderLeft: B.orange, borderBottom: B.purple, borderRight: B.purple, backgroundColor: "#F5F3FF"}}>
                <p style={{...S.s13, paddingTop: "3pt", textIndent: 0, lineHeight: "20pt", textAlign: "center"}}>03 大数据平台</p>
                <p style={{...S.s10, paddingLeft: "9pt", paddingRight: "8pt", textIndent: 0, textAlign: "center"}}>汇聚监测数据、过程数据与资源数据，开展可视化呈现、结构分析、预警研判与动态追踪。</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── 闭环流程文字 ── */}
        <p style={{paddingTop: "4pt", textIndent: 0, textAlign: "left"}}><br /></p>
        <h2 style={{...S.h2, paddingLeft: "84pt", textIndent: 0, lineHeight: "21pt", textAlign: "center"}}>框架定向 → 数据监测 → 平台分析 → 报告反馈 → 改进再监测</h2>
        <p style={{...S.s14, paddingLeft: "84pt", textIndent: 0, lineHeight: "16pt", textAlign: "center"}}>形成&quot;指标定义—数据生成—智能分析—反馈改进—动态优化&quot;的证据治理闭环。</p>

        {/* ── 构建逻辑列表 ── */}
        <p style={{...S.s1, paddingTop: "13pt", textIndent: 0, lineHeight: "22pt", textAlign: "center"}}>▎构建逻辑</p>
        <ul style={{paddingLeft: 0, listStyle: "none", margin: 0}}>
          {[
            "战略引领：以国家战略目标作为最高价值坐标",
            "素养本位：以学生长期发展作为根本尺度",
            "系统生成：以区域科学教育生态作为整体对象",
            "发展取向：以持续改进替代静态优劣判断",
            "治理嵌入：将评价结果嵌入区域教育治理决策",
            "开放演进：面向政策更新、技术迭代与实践反馈持续优化",
          ].map((text, i) => (
            <li key={i} style={{display: "block"}}>
              <p style={{...S.s15, paddingLeft: "24pt", textIndent: "-7pt", lineHeight: "14pt", textAlign: "left"}}>{"● "}{text}</p>
            </li>
          ))}
        </ul>

        {/* ── 六维协同框架表 ── */}
        <p style={{...S.s1, paddingLeft: "1pt", textIndent: 0, textAlign: "center"}}>▎六维协同框架</p>
        <table style={{...tbl, marginLeft: "5.74pt"}} cellSpacing={0}>
          <tbody>
            <tr style={{height: "53pt"}}>
              <td style={{width: "258pt", border: B.green, backgroundColor: "#EBFCF5"}}>
                <p style={{...S.s16, paddingTop: "3pt", textIndent: 0, lineHeight: "14pt", textAlign: "center"}}>01 师资基础</p>
                <p style={{...S.s17, textIndent: 0, lineHeight: "17pt", textAlign: "center"}}>科学教育师资专业发展进阶度</p>
                <p style={{...S.s18, textIndent: 0, lineHeight: "13pt", textAlign: "center"}}>师资配置｜教师素养｜专业发展</p>
              </td>
              <td style={{width: "258pt", borderTop: B.blue, borderLeft: B.green, borderBottom: B.blue, borderRight: B.orange, backgroundColor: "#EEF6FF"}}>
                <p style={{...S.s19, paddingTop: "3pt", textIndent: 0, lineHeight: "14pt", textAlign: "center"}}>02 育人成效</p>
                <p style={{...S.s17, textIndent: 0, lineHeight: "17pt", textAlign: "center"}}>科学教育学生核心素养拓展度</p>
                <p style={{...S.s18, textIndent: 0, lineHeight: "13pt", textAlign: "center"}}>科学素养｜实践创新</p>
              </td>
              <td style={{width: "258pt", borderTop: B.orange, borderLeft: B.orange, borderBottom: B.red, borderRight: B.orange, backgroundColor: "#FDF3C6"}}>
                <p style={{...S.s20, paddingTop: "3pt", textIndent: 0, lineHeight: "14pt", textAlign: "center"}}>03 协同支撑</p>
                <p style={{...S.s17, textIndent: 0, lineHeight: "17pt", textAlign: "center"}}>科学教育家校社协同育人成熟度</p>
                <p style={{...S.s18, textIndent: 0, lineHeight: "13pt", textAlign: "center"}}>协同合作｜活动开展</p>
              </td>
            </tr>
            <tr style={{height: "53pt"}}>
              <td style={{width: "258pt", borderTop: B.green, borderLeft: B.purple, borderBottom: B.purple, borderRight: B.cyan, backgroundColor: "#F5F3FF"}}>
                <p style={{...S.s21, paddingTop: "3pt", textIndent: 0, lineHeight: "14pt", textAlign: "center"}}>04 主阵地</p>
                <p style={{...S.s17, textIndent: 0, lineHeight: "17pt", textAlign: "center"}}>科学教育课程教学实施呈现度</p>
                <p style={{...S.s18, textIndent: 0, lineHeight: "13pt", textAlign: "center"}}>课程开设｜实验教学｜社团活动｜课程创新</p>
              </td>
              <td style={{width: "258pt", borderTop: B.blue, borderLeft: B.cyan, borderBottom: B.cyan, borderRight: B.red, backgroundColor: "#EBFDFF"}}>
                <p style={{...S.s22, paddingTop: "3pt", textIndent: 0, lineHeight: "14pt", textAlign: "center"}}>05 资源基础</p>
                <p style={{...S.s17, textIndent: 0, lineHeight: "17pt", textAlign: "center"}}>科学教育优质资源精准配置度</p>
                <p style={{...S.s18, textIndent: 0, lineHeight: "13pt", textAlign: "center"}}>硬件配置｜耗材保障｜资源开发</p>
              </td>
              <td style={{width: "258pt", border: B.red, backgroundColor: "#FFF0F1"}}>
                <p style={{...S.s23, paddingTop: "3pt", textIndent: 0, lineHeight: "14pt", textAlign: "center"}}>06 制度保障</p>
                <p style={{...S.s17, textIndent: 0, lineHeight: "17pt", textAlign: "center"}}>科学教育治理体系动态完善度</p>
                <p style={{...S.s18, textIndent: 0, lineHeight: "13pt", textAlign: "center"}}>机制建设｜经费投入｜督导评估</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── 维度内涵大表 ── */}
        <h2 style={{...S.h2, paddingLeft: "84pt", textIndent: 0, lineHeight: "21pt", textAlign: "center"}}>区域科学教育发展水平评估生态体系 维度内涵 · 一二级指标对应 · 闭环实施</h2>
        <h3 style={{...S.h3, textIndent: 0, lineHeight: "20pt", textAlign: "center"}}>— 维度内涵与发展导向</h3>
        <table style={{...tbl, marginLeft: "5.48998pt"}} cellSpacing={0}>
          <tbody>
            {/* 表头 */}
            <tr style={{height: "21pt"}}>
              <td style={{width: "34pt", borderTop: B.green, borderLeft: B.gray, borderBottom: B.gray, borderRight: B.gray, backgroundColor: "#0E766D"}}>
                <p style={{...S.s24, paddingTop: "2pt", textIndent: 0, textAlign: "center"}}>序号</p>
              </td>
              <td style={{width: "145pt", borderTop: B.green, borderLeft: B.gray, borderBottom: B.gray, borderRight: B.gray, backgroundColor: "#0E766D"}}>
                <p style={{...S.s24, paddingTop: "2pt", paddingLeft: "40pt", textIndent: 0, textAlign: "left"}}>一级指标（维度）</p>
              </td>
              <td style={{width: "110pt", borderTop: B.green, borderLeft: B.gray, borderBottom: B.gray, borderRight: B.gray, backgroundColor: "#0E766D"}}>
                <p style={{...S.s24, paddingTop: "2pt", textIndent: 0, textAlign: "center"}}>二级指标</p>
              </td>
              <td style={{width: "357pt", borderTop: B.green, borderLeft: B.gray, borderBottom: B.gray, borderRight: B.gray, backgroundColor: "#0E766D"}}>
                <p style={{...S.s24, paddingTop: "2pt", textIndent: 0, textAlign: "center"}}>内涵描述</p>
              </td>
              <td style={{width: "116pt", borderTop: B.green, borderLeft: B.gray, borderBottom: B.gray, borderRight: B.gray, backgroundColor: "#0E766D"}}>
                <p style={{...S.s24, paddingTop: "2pt", textIndent: 0, textAlign: "center"}}>发展导向</p>
              </td>
            </tr>
            {/* 01 师资基础 */}
            <tr style={{height: "42pt"}}>
              <td style={{width: "34pt", border: B.gray, backgroundColor: "#EBFCF5"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>01</p>
              </td>
              <td style={{width: "145pt", borderTop: B.green, borderLeft: B.gray, borderBottom: B.gray, borderRight: B.gray, backgroundColor: "#EBFCF5"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>科学教育师资专业发展进阶度</p>
                <p style={{...S.s25, textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>—— 师资基础</p>
              </td>
              <td style={{width: "110pt", borderTop: B.green, borderLeft: B.gray, borderBottom: B.gray, borderRight: B.gray, backgroundColor: "#EBFCF5"}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "41pt", paddingRight: "40pt", textIndent: 0, lineHeight: "93%", textAlign: "justify"}}>师资配置教师素养专业发展</p>
              </td>
              <td style={{width: "357pt", borderTop: B.green, borderLeft: B.gray, borderBottom: B.gray, borderRight: B.gray}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "2pt", paddingRight: "4pt", textIndent: 0, lineHeight: "93%", textAlign: "left"}}>考察科学教师队伍从基本配置走向专业进阶的发展状态，重点关注结构合理性、探究教学能力、实验指导能力，以及区域支持教师持续成长的专业发展生态。</p>
              </td>
              <td style={{width: "116pt", borderTop: B.green, borderLeft: B.gray, borderBottom: B.gray, borderRight: B.gray, backgroundColor: "#EBFCF5"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>专业进阶·结构合理·支持完备</p>
              </td>
            </tr>
            {/* 02 育人成效 */}
            <tr style={{height: "30pt"}}>
              <td style={{width: "34pt", border: B.gray, backgroundColor: "#EEF6FF"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>02</p>
              </td>
              <td style={{width: "145pt", border: B.gray, backgroundColor: "#EEF6FF"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>科学教育学生核心素养拓展度</p>
                <p style={{...S.s25, textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>—— 育人成效</p>
              </td>
              <td style={{width: "110pt", border: B.gray, backgroundColor: "#EEF6FF"}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "41pt", paddingRight: "40pt", textIndent: 0, lineHeight: "93%", textAlign: "center"}}>科学素养实践创新</p>
              </td>
              <td style={{width: "357pt", border: B.gray}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "2pt", paddingRight: "4pt", textIndent: 0, lineHeight: "93%", textAlign: "left"}}>刻画学生在系统科学学习中形成的科学知识结构、探究能力、科学态度与创新意识，以过程性、表现性证据替代单一竞赛或考试结果，确保评价面向全体学生。</p>
              </td>
              <td style={{width: "116pt", border: B.gray, backgroundColor: "#EEF6FF"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>全面发展·真实经历·素养生长</p>
              </td>
            </tr>
            {/* 03 协同支撑 */}
            <tr style={{height: "30pt"}}>
              <td style={{width: "34pt", border: B.gray, backgroundColor: "#FDF3C6"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>03</p>
              </td>
              <td style={{width: "145pt", border: B.gray, backgroundColor: "#FDF3C6"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>科学教育家校社协同育人成熟度</p>
                <p style={{...S.s25, textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>—— 协同支撑</p>
              </td>
              <td style={{width: "110pt", border: B.gray, backgroundColor: "#FDF3C6"}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "41pt", paddingRight: "40pt", textIndent: 0, lineHeight: "93%", textAlign: "center"}}>协同合作活动开展</p>
              </td>
              <td style={{width: "357pt", border: B.gray}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "2pt", paddingRight: "4pt", textIndent: 0, lineHeight: "93%", textAlign: "left"}}>考察学校、家庭与社会资源协同支持科学学习的稳定程度，突出机制制度化、合作持续性与真实学习场景拓展，推动科学教育由单一供给走向开放支撑。</p>
              </td>
              <td style={{width: "116pt", border: B.gray, backgroundColor: "#FDF3C6"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>制度协同·资源联动·真实场景</p>
              </td>
            </tr>
            {/* 04 主阵地 */}
            <tr style={{height: "54pt"}}>
              <td style={{width: "34pt", border: B.gray, backgroundColor: "#F5F3FF"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>04</p>
              </td>
              <td style={{width: "145pt", border: B.gray, backgroundColor: "#F5F3FF"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>科学教育课程教学实施呈现度</p>
                <p style={{...S.s25, textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>—— 主阵地</p>
              </td>
              <td style={{width: "110pt", border: B.gray, backgroundColor: "#F5F3FF"}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "41pt", paddingRight: "40pt", textIndent: 0, lineHeight: "93%", textAlign: "justify"}}>课程开设实验教学社团活动课程创新</p>
              </td>
              <td style={{width: "357pt", border: B.gray}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "2pt", paddingRight: "4pt", textIndent: 0, lineHeight: "93%", textAlign: "left"}}>考察国家课程标准的规范落实情况与教学方式的实质性变革，把课时、实验等规范底线与项目式、跨学科等创新高线纳入同一评价框架。</p>
              </td>
              <td style={{width: "116pt", border: B.gray, backgroundColor: "#F5F3FF"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>规范实施·探究常态·跨学科融合</p>
              </td>
            </tr>
            {/* 05 资源基础 */}
            <tr style={{height: "42pt"}}>
              <td style={{width: "34pt", border: B.gray, backgroundColor: "#EBFDFF"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>05</p>
              </td>
              <td style={{width: "145pt", border: B.gray, backgroundColor: "#EBFDFF"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>科学教育优质资源精准配置度</p>
                <p style={{...S.s25, textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>—— 资源基础</p>
              </td>
              <td style={{width: "110pt", border: B.gray, backgroundColor: "#EBFDFF"}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "41pt", paddingRight: "40pt", textIndent: 0, lineHeight: "93%", textAlign: "justify"}}>硬件配置耗材保障资源开发</p>
              </td>
              <td style={{width: "357pt", border: B.gray}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "2pt", paddingRight: "4pt", textIndent: 0, lineHeight: "93%", textAlign: "left"}}>关注科学教育资源的充足性、适切性、使用效能与配置公平，推动硬件设施、耗材保障与数字资源真正服务课堂教学、实验探究与实践学习。</p>
              </td>
              <td style={{width: "116pt", border: B.gray, backgroundColor: "#EBFDFF"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>充足适切·高效使用·公平配置</p>
              </td>
            </tr>
            {/* 06 制度保障 */}
            <tr style={{height: "42pt"}}>
              <td style={{width: "34pt", border: B.gray, backgroundColor: "#FFF0F1"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>06</p>
              </td>
              <td style={{width: "145pt", border: B.gray, backgroundColor: "#FFF0F1"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>科学教育治理体系动态完善度</p>
                <p style={{...S.s25, textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>—— 制度保障</p>
              </td>
              <td style={{width: "110pt", border: B.gray, backgroundColor: "#FFF0F1"}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "41pt", paddingRight: "40pt", textIndent: 0, lineHeight: "93%", textAlign: "justify"}}>机制建设经费投入督导评估</p>
              </td>
              <td style={{width: "357pt", border: B.gray}}>
                <p style={{...S.s26, paddingTop: "2pt", paddingLeft: "2pt", paddingRight: "4pt", textIndent: 0, lineHeight: "93%", textAlign: "left"}}>从区域教育行政层面考察规划落地、经费保障、质量督导与反馈改进机制，将统筹能力、制度建设能力和数据治理能力纳入评价核心。</p>
              </td>
              <td style={{width: "116pt", border: B.gray, backgroundColor: "#FFF0F1"}}>
                <p style={{...S.s25, paddingTop: "1pt", textIndent: 0, textAlign: "center"}}>规划落地·经费到位·督导有效</p>
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{...S.s27, paddingLeft: "5pt", textIndent: 0, lineHeight: "11pt", textAlign: "left"}}>注：框架共设 6 个一级指标、17 个二级指标、88 个三级指标；三级指标作为年度监测与平台分析的基本观测单元，详见配套《区域科学教育发展水平框架指标说明》。</p>

        {/* ── 二 闭环实施机制 ── */}
        <h3 style={{...S.h3, paddingLeft: "5pt", textIndent: 0, lineHeight: "20pt", textAlign: "left"}}>二 闭环实施机制</h3>
        <table style={{...tbl, marginLeft: "5.73999pt"}} cellSpacing={0}>
          <tbody>
            <tr style={{height: "34pt"}}>
              <td style={{width: "193pt", border: B.green, backgroundColor: "#EBFCF5"}}>
                <p style={{...S.s28, paddingTop: "2pt", paddingLeft: "1pt", textIndent: 0, lineHeight: "16pt", textAlign: "center"}}>发展框架</p>
                <p style={{...S.s29, paddingLeft: "1pt", textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>明确指标、标准、边界与应用场景</p>
              </td>
              <td style={{width: "193pt", borderTop: B.blue, borderLeft: B.green, borderBottom: B.blue, borderRight: B.blue, backgroundColor: "#EEF6FF"}}>
                <p style={{...S.s30, paddingTop: "2pt", paddingLeft: "1pt", textIndent: 0, lineHeight: "16pt", textAlign: "center"}}>年度数据监测</p>
                <p style={{...S.s29, paddingLeft: "1pt", textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>形成连续证据、识别趋势变化</p>
              </td>
              <td style={{width: "192pt", borderTop: B.purple, borderLeft: B.blue, borderBottom: B.ghostW, borderRight: B.orange, backgroundColor: "#F5F3FF"}}>
                <p style={{...S.s31, paddingTop: "2pt", paddingLeft: "1pt", textIndent: 0, lineHeight: "16pt", textAlign: "center"}}>大数据平台</p>
                <p style={{...S.s29, paddingLeft: "1pt", textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>支撑汇聚、分析、可视化与预警</p>
              </td>
              <td style={{width: "193pt", border: B.orange, backgroundColor: "#FDF3C6"}}>
                <p style={{...S.s32, paddingTop: "2pt", paddingLeft: "1pt", textIndent: 0, lineHeight: "16pt", textAlign: "center"}}>报告反馈</p>
                <p style={{...S.s29, paddingLeft: "1pt", textIndent: 0, lineHeight: "12pt", textAlign: "center"}}>输出诊断建议，推动治理改进</p>
              </td>
            </tr>
            <tr style={{height: "16pt"}}>
              <td style={{width: "193pt", borderTop: B.green, backgroundColor: "#F8F9FB"}}>
                <p style={{...S.s26, paddingLeft: "58pt", textIndent: 0, lineHeight: "13pt", textAlign: "left"}}>提供评价依据与共同语言</p>
              </td>
              <td style={{width: "193pt", borderTop: B.blue, backgroundColor: "#F8F9FB"}}>
                <p style={{...S.s26, paddingLeft: "47pt", textIndent: 0, lineHeight: "13pt", textAlign: "left"}}>完成数据采集、审核与纵向追踪</p>
              </td>
              <td style={{width: "192pt", borderTop: B.ghostW, backgroundColor: "#F8F9FB"}}>
                <p style={{...S.s26, paddingLeft: "40pt", textIndent: 0, lineHeight: "13pt", textAlign: "left"}}>开展结构分析、差异识别与趋势研判</p>
              </td>
              <td style={{width: "193pt", borderTop: B.orange, backgroundColor: "#F8F9FB"}}>
                <p style={{...S.s26, paddingLeft: "40pt", textIndent: 0, lineHeight: "13pt", textAlign: "left"}}>形成区域报告、学校反馈和改进清单</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── 三 使用定位 · 评价边界 · 动态演进 ── */}
        <table style={{...tbl, marginLeft: "3pt"}} cellSpacing={0}>
          <tbody>
            <tr style={{height: "49pt"}}>
              <td style={{width: "257pt", border: B.green, backgroundColor: "#EBFCF5"}}>
                <p style={{...S.s28, paddingTop: "3pt", paddingLeft: "115pt", textIndent: "-10pt", lineHeight: "16pt", textAlign: "left"}}>{"◆ "}使用定位</p>
                <p style={{...S.s29, paddingLeft: "61pt", paddingRight: "4pt", textIndent: "-56pt", textAlign: "left"}}>用于区域科学教育现状诊断、专项督导与专业支持、资源配置与投入决策，以及实验区、示范区建设成效分析与经验提炼。</p>
              </td>
              <td style={{width: "256pt", borderTop: B.blue, borderLeft: B.green, borderBottom: B.blue, borderRight: B.orange, backgroundColor: "#EEF6FF"}}>
                <p style={{...S.s30, paddingTop: "3pt", paddingLeft: "115pt", textIndent: "-10pt", lineHeight: "16pt", textAlign: "left"}}>{"◆ "}评价边界</p>
                <p style={{...S.s29, paddingLeft: "68pt", paddingRight: "4pt", textIndent: "-62pt", textAlign: "left"}}>坚持发展性、诊断性导向，不用于学校或区域排名评价，不作为绩效考核或问责依据；不鼓励简单加权形成综合得分。</p>
              </td>
              <td style={{width: "262pt", border: B.orange, backgroundColor: "#FDF3C6"}}>
                <p style={{...S.s32, paddingTop: "3pt", paddingLeft: "118pt", textIndent: "-10pt", lineHeight: "16pt", textAlign: "left"}}>{"◆ "}动态演进</p>
                <p style={{...S.s29, paddingLeft: "88pt", paddingRight: "4pt", textIndent: "-84pt", textAlign: "left"}}>根据国家政策调整、年度监测结果、区域实践反馈和人工智能、虚拟实验等新形态发展进行周期性修订完善。</p>
              </td>
            </tr>
            <tr style={{height: "35pt"}}>
              <td colSpan={3} style={{width: "775pt", borderTop: B.orange, backgroundColor: "#B6DDE8"}}>
                <p style={{...S.s17, paddingTop: "8pt", textIndent: 0, textAlign: "center"}}>北京市中小学科学教育研究指导中心 二〇二六年五月</p>
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{textIndent: 0, textAlign: "left"}}></p>
        <h3 style={{...S.h3, paddingLeft: "5pt", textIndent: 0, textAlign: "left"}}>三 使用定位 · 评价边界 · 动态演进</h3>

      </div>
    );
  }
}

export default HomePageNew;
