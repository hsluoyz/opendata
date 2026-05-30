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
import {Helmet} from "react-helmet";

const FONT = "\"Microsoft YaHei\", sans-serif";
const BASE = {fontFamily: FONT, fontStyle: "normal", textDecoration: "none", margin: 0};

const C = {
  green: "#0E766D",
  blue: "#2462EB",
  orange: "#D97705",
  purple: "#7B39EC",
  cyan: "#0891B1",
  red: "#BD123B",
  dark: "#0E172A",
  slate: "#334154",
  mid: "#465469",
  light: "#63748A",
  bgGreen: "#EBFCF5",
  bgBlue: "#EEF6FF",
  bgYellow: "#FDF3C6",
  bgPurple: "#F5F3FF",
  bgCyan: "#EBFDFF",
  bgRed: "#FFF0F1",
  bgFog: "#F8F9FB",
  borderGray: "#CAD4E0",
};

const bd = (color, w = "1px") => `${w} solid ${color}`;

const SectionLabel = ({color = C.green, children, style = {}}) => (
  <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 8, ...style}}>
    <div style={{width: 3, alignSelf: "stretch", minHeight: 16, backgroundColor: color, borderRadius: 2}} />
    <span style={{...BASE, color, fontWeight: "bold", fontSize: "14pt"}}>{children}</span>
  </div>
);

const EcoCell = ({num, title, desc, titleColor, borderColor, bg}) => (
  <div style={{border: bd(borderColor), backgroundColor: bg, padding: "8px 10px", flex: 1}}>
    <div style={{...BASE, color: titleColor, fontWeight: "bold", fontSize: "14pt", marginBottom: 4}}>{num} {title}</div>
    <div style={{...BASE, color: C.slate, fontSize: "9.5pt", lineHeight: 1.5}}>{desc}</div>
  </div>
);

const SixCell = ({num, tag, title, items, numColor, bg, borderColor}) => (
  <div style={{border: bd(borderColor), backgroundColor: bg, padding: "8px 12px", flex: 1, textAlign: "center"}}>
    <div style={{...BASE, color: numColor, fontWeight: "bold", fontSize: "10pt", marginBottom: 2}}>{num} {tag}</div>
    <div style={{...BASE, color: C.dark, fontWeight: "bold", fontSize: "12pt", lineHeight: 1.4, marginBottom: 4}}>{title}</div>
    <div style={{...BASE, color: C.mid, fontSize: "9.5pt"}}>{items.join("｜")}</div>
  </div>
);

const dimRows = [
  {
    id: "01", bg: C.bgGreen, titleColor: C.green,
    title: "科学教育师资专业发展进阶度", sub: "师资基础",
    items: ["师资配置", "教师素养", "专业发展"],
    desc: "考察科学教师队伍从基本配置走向专业进阶的发展状态，重点关注结构合理性、探究教学能力、实验指导能力，以及区域支持教师持续成长的专业发展生态。",
    direction: "专业进阶·结构合理·支持完备",
  },
  {
    id: "02", bg: C.bgBlue, titleColor: C.blue,
    title: "科学教育学生核心素养拓展度", sub: "育人成效",
    items: ["科学素养", "实践创新"],
    desc: "刻画学生在系统科学学习中形成的科学知识结构、探究能力、科学态度与创新意识，以过程性、表现性证据替代单一竞赛或考试结果，确保评价面向全体学生。",
    direction: "全面发展·真实经历·素养生长",
  },
  {
    id: "03", bg: C.bgYellow, titleColor: C.orange,
    title: "科学教育家校社协同育人成熟度", sub: "协同支撑",
    items: ["协同合作", "活动开展"],
    desc: "考察学校、家庭与社会资源协同支持科学学习的稳定程度，突出机制制度化、合作持续性与真实学习场景拓展，推动科学教育由单一供给走向开放支撑。",
    direction: "制度协同·资源联动·真实场景",
  },
  {
    id: "04", bg: C.bgPurple, titleColor: C.purple,
    title: "科学教育课程教学实施呈现度", sub: "主阵地",
    items: ["课程开设", "实验教学", "社团活动", "课程创新"],
    desc: "考察国家课程标准的规范落实情况与教学方式的实质性变革，把课时、实验等规范底线与项目式、跨学科等创新高线纳入同一评价框架。",
    direction: "规范实施·探究常态·跨学科融合",
  },
  {
    id: "05", bg: C.bgCyan, titleColor: C.cyan,
    title: "科学教育优质资源精准配置度", sub: "资源基础",
    items: ["硬件配置", "耗材保障", "资源开发"],
    desc: "关注科学教育资源的充足性、适切性、使用效能与配置公平，推动硬件设施、耗材保障与数字资源真正服务课堂教学、实验探究与实践学习。",
    direction: "充足适切·高效使用·公平配置",
  },
  {
    id: "06", bg: C.bgRed, titleColor: C.red,
    title: "科学教育治理体系动态完善度", sub: "制度保障",
    items: ["机制建设", "经费投入", "督导评估"],
    desc: "从区域教育行政层面考察规划落地、经费保障、质量督导与反馈改进机制，将统筹能力、制度建设能力和数据治理能力纳入评价核心。",
    direction: "规划落地·经费到位·督导有效",
  },
];

class HomePageNew extends React.Component {
  render() {
    return (
      <div style={{fontFamily: FONT, padding: "20px 28px", boxSizing: "border-box", color: C.dark}}>
        <Helmet><title>首页 - 教育数据管理平台</title></Helmet>

        {/* ── 封面标题区（三栏） ── */}
        <div style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8}}>
          <div style={{minWidth: 130}}>
            <div style={{...BASE, color: C.green, fontWeight: "bold", fontSize: "15pt"}}>评估生态体系</div>
            <div style={{...BASE, color: C.mid, fontSize: "10pt", marginTop: 3}}>诊断 · 监测 · 反馈 · 改进</div>
          </div>
          <div style={{flex: 1, textAlign: "center", padding: "0 20px"}}>
            <div style={{...BASE, color: C.dark, fontWeight: "bold", fontSize: "27pt", lineHeight: 1.3}}>
              区域科学教育发展水平评估体系
            </div>
            <div style={{...BASE, color: C.light, fontSize: "11pt", marginTop: 6}}>
              Regional Science Education Development Assessment Ecosystem
            </div>
            <div style={{...BASE, color: C.green, fontWeight: "bold", fontSize: "12pt", marginTop: 8, lineHeight: 1.6}}>
              以发展框架为牵引、以年度数据监测为基础、以大数据平台为支撑、以报告反馈为闭环的区域科学教育治理支持体系
            </div>
          </div>
          <div style={{minWidth: 130, textAlign: "right"}}>
            <div style={{...BASE, color: C.dark, fontWeight: "bold", fontSize: "14pt", lineHeight: "22pt"}}>北京市中小学</div>
            <div style={{...BASE, color: C.dark, fontWeight: "bold", fontSize: "14pt", lineHeight: "22pt"}}>科学教育研究指导中心</div>
          </div>
        </div>

        {/* ── 主体两列布局 ── */}
        <div style={{display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 16}}>

          {/* 左列: 体系总述 + 指标统计 + 构建逻辑 */}
          <div style={{flex: "0 0 42%", minWidth: 0}}>
            <SectionLabel>体系总述</SectionLabel>
            <p style={{...BASE, color: C.slate, fontSize: "10.5pt", lineHeight: 1.65, textAlign: "justify", marginBottom: 14}}>
              《区域科学教育发展水平评估生态体系》立足教育强国、科技强国和人才强国战略要求，围绕科学教育&quot;育人目标—关键要素—运行机制—治理保障&quot;的内在逻辑，构建由发展框架、年度数据监测、大数据平台、报告反馈与改进应用组成的闭环体系。体系以学生科学核心素养发展为根本，以教师专业发展、课程教学、资源配置、协同育人与治理能力为关键支撑，推动区域科学教育从经验判断走向证据治理、从阶段评估走向持续改进，为科学教育高质量发展提供可诊断、可监测、可反馈、可改进、可引领的行动坐标。
            </p>

            {/* 指标统计三格 */}
            <div style={{display: "flex", marginBottom: 16, borderRadius: 4, overflow: "hidden"}}>
              {[
                {num: "6", label: "一级指标", bg: C.bgGreen, color: C.green},
                {num: "17", label: "二级指标", bg: C.bgBlue, color: C.blue},
                {num: "88", label: "三级指标", bg: C.bgYellow, color: C.orange},
              ].map(({num, label, bg, color}) => (
                <div key={label} style={{flex: 1, backgroundColor: bg, padding: "12px 6px", textAlign: "center"}}>
                  <div style={{...BASE, color, fontWeight: "bold", fontSize: "30pt", lineHeight: 1.1}}>{num}</div>
                  <div style={{...BASE, color: C.slate, fontWeight: "bold", fontSize: "10.5pt", marginTop: 4}}>{label}</div>
                </div>
              ))}
            </div>

            <SectionLabel style={{marginTop: 4}}>构建逻辑</SectionLabel>
            {[
              "战略引领：以国家战略目标作为最高价值坐标",
              "素养本位：以学生长期发展作为根本尺度",
              "系统生成：以区域科学教育生态作为整体对象",
              "发展取向：以持续改进替代静态优劣判断",
              "治理嵌入：将评价结果嵌入区域教育治理决策",
              "开放演进：面向政策更新、技术迭代与实践反馈持续优化",
            ].map((text, i) => (
              <div key={i} style={{...BASE, color: C.slate, fontSize: "10pt", lineHeight: "16pt", paddingLeft: 8}}>
                {"● "}{text}
              </div>
            ))}
          </div>

          {/* 右列: 闭环生态结构 */}
          <div style={{flex: 1, minWidth: 0}}>
            <SectionLabel>闭环生态结构</SectionLabel>

            {/* 2×2 网格 */}
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: 12}}>
              <EcoCell
                num="01" title="发展框架"
                desc="明确评价维度、指标层级与边界原则，形成区域科学教育发展的共同语言与结构坐标。"
                titleColor={C.green} borderColor={C.green} bg={C.bgGreen}
              />
              <EcoCell
                num="02" title="年度数据监测"
                desc="围绕三级指标开展年度数据采集、质量校验与趋势跟踪，形成连续、可比、可追踪的证据基础。"
                titleColor={C.blue} borderColor={C.blue} bg={C.bgBlue}
              />
              <EcoCell
                num="04" title="报告反馈应用"
                desc="生成区域诊断报告、学校反馈报告与治理建议清单，推动政策优化、资源调配和实践改进。"
                titleColor={C.orange} borderColor={C.orange} bg={C.bgYellow}
              />
              <EcoCell
                num="03" title="大数据平台"
                desc="汇聚监测数据、过程数据与资源数据，开展可视化呈现、结构分析、预警研判与动态追踪。"
                titleColor={C.purple} borderColor={C.purple} bg={C.bgPurple}
              />
            </div>

            {/* 流程文字 */}
            <div style={{textAlign: "center", padding: "8px 0"}}>
              <div style={{...BASE, color: C.dark, fontWeight: "bold", fontSize: "14pt", letterSpacing: 0.5}}>
                框架定向 → 数据监测 → 平台分析 → 报告反馈 → 改进再监测
              </div>
              <div style={{...BASE, color: C.mid, fontSize: "11pt", marginTop: 6}}>
                形成&quot;指标定义—数据生成—智能分析—反馈改进—动态优化&quot;的证据治理闭环。
              </div>
            </div>
          </div>
        </div>

        {/* ── 六维协同框架 ── */}
        <SectionLabel>六维协同框架</SectionLabel>
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 24}}>
          <SixCell num="01" tag="师资基础" title="科学教育师资专业发展进阶度"
            items={["师资配置", "教师素养", "专业发展"]} numColor={C.green} bg={C.bgGreen} borderColor={C.green} />
          <SixCell num="02" tag="育人成效" title="科学教育学生核心素养拓展度"
            items={["科学素养", "实践创新"]} numColor={C.blue} bg={C.bgBlue} borderColor={C.blue} />
          <SixCell num="03" tag="协同支撑" title="科学教育家校社协同育人成熟度"
            items={["协同合作", "活动开展"]} numColor={C.orange} bg={C.bgYellow} borderColor={C.orange} />
          <SixCell num="04" tag="主阵地" title="科学教育课程教学实施呈现度"
            items={["课程开设", "实验教学", "社团活动", "课程创新"]} numColor={C.purple} bg={C.bgPurple} borderColor={C.purple} />
          <SixCell num="05" tag="资源基础" title="科学教育优质资源精准配置度"
            items={["硬件配置", "耗材保障", "资源开发"]} numColor={C.cyan} bg={C.bgCyan} borderColor={C.cyan} />
          <SixCell num="06" tag="制度保障" title="科学教育治理体系动态完善度"
            items={["机制建设", "经费投入", "督导评估"]} numColor={C.red} bg={C.bgRed} borderColor={C.red} />
        </div>

        {/* ── 维度内涵大表标题 ── */}
        <div style={{...BASE, color: C.dark, fontWeight: "bold", fontSize: "15pt", textAlign: "center", marginBottom: 4}}>
          区域科学教育发展水平评估生态体系 维度内涵 · 一二级指标对应 · 闭环实施
        </div>
        <div style={{...BASE, color: C.green, fontWeight: "bold", fontSize: "14pt", textAlign: "center", marginBottom: 10}}>
          一 维度内涵与发展导向
        </div>

        {/* ── 维度内涵表 ── */}
        <table style={{width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginBottom: 6}}>
          <colgroup>
            <col style={{width: "4%"}} />
            <col style={{width: "20%"}} />
            <col style={{width: "13%"}} />
            <col style={{width: "44%"}} />
            <col style={{width: "19%"}} />
          </colgroup>
          <thead>
            <tr style={{backgroundColor: C.green}}>
              {["序号", "一级指标（维度）", "二级指标", "内涵描述", "发展导向"].map((h) => (
                <th key={h} style={{...BASE, color: "#FFF", fontWeight: "bold", fontSize: "10pt",
                  padding: "6px 8px", textAlign: "center", border: bd(C.borderGray)}}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dimRows.map(({id, bg, titleColor, title, sub, items, desc, direction}) => (
              <tr key={id} style={{verticalAlign: "middle"}}>
                <td style={{backgroundColor: bg, border: bd(C.borderGray), padding: "8px 4px", textAlign: "center"}}>
                  <span style={{...BASE, color: C.dark, fontWeight: "bold", fontSize: "9pt"}}>{id}</span>
                </td>
                <td style={{backgroundColor: bg, border: bd(C.borderGray), padding: "8px", textAlign: "center"}}>
                  <div style={{...BASE, color: titleColor, fontWeight: "bold", fontSize: "10pt", lineHeight: 1.4}}>{title}</div>
                  <div style={{...BASE, color: C.slate, fontSize: "9pt", marginTop: 2}}>—— {sub}</div>
                </td>
                <td style={{backgroundColor: bg, border: bd(C.borderGray), padding: "8px 6px", textAlign: "center"}}>
                  {items.map((item, i) => (
                    <div key={i} style={{...BASE, color: C.dark, fontSize: "9pt", lineHeight: "16pt"}}>{item}</div>
                  ))}
                </td>
                <td style={{border: bd(C.borderGray), padding: "8px 10px", verticalAlign: "middle"}}>
                  <span style={{...BASE, color: C.dark, fontSize: "9.5pt", lineHeight: 1.6}}>{desc}</span>
                </td>
                <td style={{backgroundColor: bg, border: bd(C.borderGray), padding: "8px 6px", textAlign: "center", verticalAlign: "middle"}}>
                  <span style={{...BASE, color: titleColor, fontWeight: "bold", fontSize: "9pt"}}>{direction}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{...BASE, color: C.mid, fontSize: "9pt", marginBottom: 16, paddingLeft: 2}}>
          注：框架共设 6 个一级指标、17 个二级指标、88 个三级指标；三级指标作为年度监测与平台分析的基本观测单元，详见配套《区域科学教育发展水平框架指标说明》。
        </div>

        {/* ── 二 闭环实施机制 ── */}
        <div style={{...BASE, color: C.green, fontWeight: "bold", fontSize: "14pt", marginBottom: 8}}>
          二 闭环实施机制
        </div>
        <div style={{display: "flex", marginBottom: 0}}>
          {[
            {title: "发展框架", sub: "明确指标、标准、边界与应用场景", color: C.green, bg: C.bgGreen, borderColor: C.green},
            {title: "年度数据监测", sub: "形成连续证据、识别趋势变化", color: C.blue, bg: C.bgBlue, borderColor: C.blue},
            {title: "大数据平台", sub: "支撑汇聚、分析、可视化与预警", color: C.purple, bg: C.bgPurple, borderColor: C.purple},
            {title: "报告反馈", sub: "输出诊断建议，推动治理改进", color: C.orange, bg: C.bgYellow, borderColor: C.orange},
          ].map(({title, sub, color, bg, borderColor}) => (
            <div key={title} style={{flex: 1, border: bd(borderColor), backgroundColor: bg, padding: "8px 10px", textAlign: "center"}}>
              <div style={{...BASE, color, fontWeight: "bold", fontSize: "11pt", marginBottom: 4}}>{title}</div>
              <div style={{...BASE, color: C.slate, fontSize: "9pt"}}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{display: "flex", marginBottom: 16}}>
          {[
            {text: "提供评价依据与共同语言", borderColor: C.green},
            {text: "完成数据采集、审核与纵向追踪", borderColor: C.blue},
            {text: "开展结构分析、差异识别与趋势研判", borderColor: C.purple},
            {text: "形成区域报告、学校反馈和改进清单", borderColor: C.orange},
          ].map(({text, borderColor}) => (
            <div key={text} style={{flex: 1, backgroundColor: C.bgFog, borderTop: bd(borderColor), padding: "4px 8px", textAlign: "center"}}>
              <span style={{...BASE, color: C.dark, fontSize: "9pt"}}>{text}</span>
            </div>
          ))}
        </div>

        {/* ── 三 使用定位 · 评价边界 · 动态演进 ── */}
        <div style={{display: "flex", marginBottom: 0}}>
          {[
            {
              bullet: "◆", bulletColor: C.green, title: "使用定位",
              titleColor: C.green, bg: C.bgGreen, borderColor: C.green,
              text: "用于区域科学教育现状诊断、专项督导与专业支持、资源配置与投入决策，以及实验区、示范区建设成效分析与经验提炼。",
            },
            {
              bullet: "◆", bulletColor: C.blue, title: "评价边界",
              titleColor: C.blue, bg: C.bgBlue, borderColor: C.blue,
              text: "坚持发展性、诊断性导向，不用于学校或区域排名评价，不作为绩效考核或问责依据；不鼓励简单加权形成综合得分。",
            },
            {
              bullet: "◆", bulletColor: C.orange, title: "动态演进",
              titleColor: C.orange, bg: C.bgYellow, borderColor: C.orange,
              text: "根据国家政策调整、年度监测结果、区域实践反馈和人工智能、虚拟实验等新形态发展进行周期性修订完善。",
            },
          ].map(({bullet, bulletColor, title, titleColor, bg, borderColor, text}) => (
            <div key={title} style={{flex: 1, border: bd(borderColor), backgroundColor: bg, padding: "10px 14px"}}>
              <div style={{...BASE, color: titleColor, fontWeight: "bold", fontSize: "11pt", marginBottom: 6}}>
                <span style={{color: bulletColor}}>{bullet} </span>{title}
              </div>
              <div style={{...BASE, color: C.slate, fontSize: "9pt", lineHeight: 1.7}}>{text}</div>
            </div>
          ))}
        </div>

        {/* ── 页脚 ── */}
        <div style={{backgroundColor: "#B6DDE8", padding: "10px 0", textAlign: "center", marginTop: 0}}>
          <span style={{...BASE, color: C.dark, fontWeight: "bold", fontSize: "12pt"}}>
            北京市中小学科学教育研究指导中心 二〇二六年五月
          </span>
        </div>

      </div>
    );
  }
}

export default HomePageNew;
