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
import {Card, Col, Empty, Row, Spin, Statistic, Typography} from "antd";
import {
  ApartmentOutlined,
  BankOutlined,
  BookOutlined,
  FileOutlined,
  HeartOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import * as StatBackend from "./backend/StatBackend";
import * as DashboardBackend from "./backend/DashboardBackend";
import * as Setting from "./Setting";

const {Title} = Typography;

const ENTITY_COLORS = {
  student: "#c2185b",
  teacher: "#00838f",
  class: "#f57c00",
  file: "#283593",
};

const PIE_COLORS = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"];

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      trend: null,
      fileTypeDist: null,
      schoolDist: null,
      heatmap: null,
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    this.loadAllData();
    window.addEventListener("schoolChanged", this.onSchoolChanged);
  }

  componentWillUnmount() {
    window.removeEventListener("schoolChanged", this.onSchoolChanged);
  }

  onSchoolChanged = () => {
    this.loadAllData();
  };

  loadAllData() {
    const school = Setting.getSchool(this.props.account);
    this.setState({loading: true});

    const promises = [
      StatBackend.getStats(school),
      DashboardBackend.getDashboardTrend(school),
      DashboardBackend.getDashboardFileTypeDist(school),
      DashboardBackend.getDashboardHeatmap(school),
    ];
    if (!school) {
      promises.push(DashboardBackend.getDashboardSchoolDist());
    }

    Promise.all(promises)
      .then(([statsRes, trendRes, fileTypeRes, heatmapRes, schoolDistRes]) => {
        this.setState({
          stats: statsRes?.status === "ok" ? statsRes.data : null,
          trend: trendRes?.status === "ok" ? trendRes.data : null,
          fileTypeDist: fileTypeRes?.status === "ok" ? fileTypeRes.data : null,
          heatmap: heatmapRes?.status === "ok" ? heatmapRes.data : null,
          schoolDist: schoolDistRes?.status === "ok" ? schoolDistRes.data : null,
          loading: false,
        });
      })
      .catch(() => this.setState({loading: false}));
  }

  getTrendOption() {
    const {trend} = this.state;
    if (!trend) {
      return {};
    }

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {type: "cross", label: {backgroundColor: "#6a7985"}},
      },
      legend: {
        data: ["学生", "教师", "班级", "文件"],
        top: 5,
        textStyle: {fontSize: 12},
      },
      grid: {left: "3%", right: "4%", bottom: "3%", top: "18%", containLabel: true},
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: trend.dates,
        axisLabel: {fontSize: 11},
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: {fontSize: 11},
      },
      series: [
        {
          name: "学生",
          type: "line",
          smooth: true,
          symbol: "none",
          areaStyle: {opacity: 0.15},
          lineStyle: {width: 2, color: ENTITY_COLORS.student},
          color: ENTITY_COLORS.student,
          data: trend.studentCounts,
        },
        {
          name: "教师",
          type: "line",
          smooth: true,
          symbol: "none",
          areaStyle: {opacity: 0.15},
          lineStyle: {width: 2, color: ENTITY_COLORS.teacher},
          color: ENTITY_COLORS.teacher,
          data: trend.teacherCounts,
        },
        {
          name: "班级",
          type: "line",
          smooth: true,
          symbol: "none",
          areaStyle: {opacity: 0.15},
          lineStyle: {width: 2, color: ENTITY_COLORS.class},
          color: ENTITY_COLORS.class,
          data: trend.classCounts,
        },
        {
          name: "文件",
          type: "line",
          smooth: true,
          symbol: "none",
          areaStyle: {opacity: 0.15},
          lineStyle: {width: 2, color: ENTITY_COLORS.file},
          color: ENTITY_COLORS.file,
          data: trend.fileCounts,
        },
      ],
    };
  }

  getFileTypeOption() {
    const {fileTypeDist} = this.state;
    if (!fileTypeDist || fileTypeDist.length === 0) {
      return null;
    }

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        right: "5%",
        top: "middle",
        textStyle: {fontSize: 12},
        type: "scroll",
      },
      series: [
        {
          name: "文件类型",
          type: "pie",
          radius: ["38%", "65%"],
          center: ["38%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {borderRadius: 5, borderColor: "#fff", borderWidth: 2},
          label: {show: false},
          emphasis: {
            label: {show: true, fontSize: 13, fontWeight: "bold"},
            itemStyle: {shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.2)"},
          },
          data: fileTypeDist.map((item, idx) => ({
            name: item.type || "其他",
            value: item.count,
            itemStyle: {color: PIE_COLORS[idx % PIE_COLORS.length]},
          })),
        },
      ],
    };
  }

  getSchoolDistOption() {
    const {schoolDist} = this.state;
    if (!schoolDist || schoolDist.length === 0) {
      return null;
    }

    return {
      tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
      legend: {data: ["学生", "教师", "班级"], top: 5, textStyle: {fontSize: 12}},
      grid: {left: "3%", right: "4%", bottom: "3%", top: "18%", containLabel: true},
      xAxis: {
        type: "category",
        data: schoolDist.map(s => s.school),
        axisLabel: {
          fontSize: 11,
          rotate: schoolDist.length > 4 ? 25 : 0,
          overflow: "truncate",
          width: 80,
        },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: {fontSize: 11},
      },
      series: [
        {
          name: "学生",
          type: "bar",
          data: schoolDist.map(s => s.studentCount),
          color: ENTITY_COLORS.student,
          barMaxWidth: 22,
        },
        {
          name: "教师",
          type: "bar",
          data: schoolDist.map(s => s.teacherCount),
          color: ENTITY_COLORS.teacher,
          barMaxWidth: 22,
        },
        {
          name: "班级",
          type: "bar",
          data: schoolDist.map(s => s.classCount),
          color: ENTITY_COLORS.class,
          barMaxWidth: 22,
        },
      ],
    };
  }

  getHeatmapOption() {
    const {heatmap} = this.state;
    if (!heatmap) {
      return {};
    }

    const calendarData = heatmap.data.map(d => [d.date, d.count]);

    return {
      tooltip: {
        formatter: params => `${params.value[0]}&nbsp;&nbsp;&nbsp;操作 ${params.value[1]} 次`,
      },
      visualMap: {
        min: 0,
        max: Math.max(heatmap.maxCount, 1),
        show: false,
        inRange: {
          color: ["#f3f0ff", "#d9d1f7", "#b5a8ef", "#7c5ce0", "#5734d3"],
        },
      },
      calendar: {
        range: heatmap.dateRange,
        cellSize: [13, 13],
        left: 40,
        right: 15,
        top: 28,
        bottom: 10,
        dayLabel: {
          nameMap: ["日", "一", "二", "三", "四", "五", "六"],
          fontSize: 10,
        },
        monthLabel: {
          nameMap: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
          fontSize: 10,
        },
        yearLabel: {show: false},
        itemStyle: {borderWidth: 1, borderColor: "#fff"},
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: calendarData,
        },
      ],
    };
  }

  renderChart(title, content, cardStyle) {
    return (
      <Card
        title={<span style={{fontWeight: 600, fontSize: 14}}>{title}</span>}
        style={{borderRadius: 8, border: "1px solid #e8e8e8", ...cardStyle}}
        styles={{body: {padding: "12px 16px"}}}
      >
        {content}
      </Card>
    );
  }

  render() {
    const {stats, trend, heatmap, loading} = this.state;
    const school = Setting.getSchool(this.props.account);
    const isGlobal = !school;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 300}}>
          <Spin size="large" />
        </div>
      );
    }

    const statItems = [
      {title: "学校", value: stats?.schoolCount ?? 0, icon: <BankOutlined />, color: "#1565c0"},
      {title: "年级", value: stats?.gradeCount ?? 0, icon: <ApartmentOutlined />, color: "#2e7d32"},
      {title: "班级", value: stats?.classCount ?? 0, icon: <TeamOutlined />, color: "#f57c00"},
      {title: "学科", value: stats?.subjectCount ?? 0, icon: <BookOutlined />, color: "#6a1b9a"},
      {title: "教师", value: stats?.teacherCount ?? 0, icon: <UserOutlined />, color: "#00838f"},
      {title: "学生", value: stats?.studentCount ?? 0, icon: <SolutionOutlined />, color: "#c2185b"},
      {title: "家长", value: stats?.parentCount ?? 0, icon: <HeartOutlined />, color: "#e65100"},
      {title: "文件", value: stats?.fileCount ?? 0, icon: <FileOutlined />, color: "#283593"},
    ];

    const trendOption = this.getTrendOption();
    const fileTypeOption = this.getFileTypeOption();
    const schoolDistOption = this.getSchoolDistOption();
    const heatmapOption = this.getHeatmapOption();

    return (
      <div style={{padding: 24}}>
        <div className="edu-home-hero">
          <h2>欢迎进入教育数据管理平台</h2>
          <p>严谨规范的数据治理，陪伴师生阳光成长。请选择上方学校、年级、班级后开展日常管理。</p>
        </div>

        <Title level={4} style={{marginBottom: 18, color: "#0d47a1", fontWeight: 700}}>数据概览</Title>
        <Row gutter={[16, 16]}>
          {statItems.map((item) => (
            <Col key={item.title} xs={24} sm={12} md={8} lg={6}>
              <Card
                className="edu-stat-card"
                style={{["--edu-stat-accent"]: item.color}}
                styles={{body: {padding: "20px 24px 20px 22px"}}}
              >
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                  <Statistic
                    title={item.title}
                    value={item.value}
                    valueStyle={{color: item.color, fontSize: 32, fontWeight: 700}}
                  />
                  <div style={{fontSize: 40, color: item.color, opacity: 0.18}}>
                    {item.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Trend + File type distribution */}
        <Row gutter={[16, 16]} style={{marginTop: 20}}>
          <Col xs={24} lg={16}>
            {this.renderChart(
              "近30天数据增长趋势",
              trend
                ? <ReactECharts option={trendOption} style={{height: 280}} notMerge={true} />
                : <Empty description="暂无数据" style={{padding: "60px 0"}} />
            )}
          </Col>
          <Col xs={24} lg={8}>
            {this.renderChart(
              "文件类型分布",
              fileTypeOption
                ? <ReactECharts option={fileTypeOption} style={{height: 280}} notMerge={true} />
                : <Empty description="暂无文件数据" style={{padding: "60px 0"}} />
            )}
          </Col>
        </Row>

        {/* School distribution (global only) + Activity heatmap */}
        <Row gutter={[16, 16]} style={{marginTop: 16}}>
          {isGlobal && (
            <Col xs={24} lg={12}>
              {this.renderChart(
                "各学校数据规模",
                schoolDistOption
                  ? <ReactECharts option={schoolDistOption} style={{height: 260}} notMerge={true} />
                  : <Empty description="暂无学校数据" style={{padding: "60px 0"}} />
              )}
            </Col>
          )}
          <Col xs={24} lg={isGlobal ? 12 : 24}>
            {this.renderChart(
              "操作活跃度（近一年）",
              heatmap
                ? <ReactECharts option={heatmapOption} style={{height: 170}} notMerge={true} />
                : <Empty description="暂无操作记录" style={{padding: "40px 0"}} />,
              {}
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

export default HomePage;
