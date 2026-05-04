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
import {Card, Col, Row, Spin, Statistic, Typography} from "antd";
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
import * as StatBackend from "./backend/StatBackend";
import * as Setting from "./Setting";

const {Title} = Typography;

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    this.getStats();
    window.addEventListener("schoolChanged", this.onSchoolChanged);
  }

  componentWillUnmount() {
    window.removeEventListener("schoolChanged", this.onSchoolChanged);
  }

  onSchoolChanged = () => {
    this.getStats();
  };

  getStats() {
    const school = Setting.getSchool(this.props.account);
    this.setState({loading: true});
    StatBackend.getStats(school).then(res => {
      if (res.status === "ok") {
        this.setState({stats: res.data, loading: false});
      } else {
        this.setState({loading: false});
      }
    }).catch(() => {
      this.setState({loading: false});
    });
  }

  render() {
    const {stats, loading} = this.state;

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
                  <div style={{
                    fontSize: 40,
                    color: item.color,
                    opacity: 0.18,
                  }}>
                    {item.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}

export default HomePage;
