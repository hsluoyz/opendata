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
import {Button, Card, Form, Input, InputNumber, Select, Spin} from "antd";
import * as GradeBackend from "./backend/GradeBackend";
import * as SchoolBackend from "./backend/SchoolBackend";
import * as Setting from "./Setting";

class GradeEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grade: null,
      schools: [],
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    const {owner, name} = this.props.match.params;
    Promise.all([
      GradeBackend.getGrade(owner, name),
      SchoolBackend.getSchools("admin", 1, 1000, "", "", "", ""),
    ]).then(([gradeRes, schoolRes]) => {
      if (gradeRes.status === "ok") {
        this.setState({grade: gradeRes.data});
      } else {
        Setting.showMessage("error", gradeRes.msg);
      }
      if (schoolRes.status === "ok") {
        this.setState({schools: schoolRes.data || []});
      }
      this.setState({loading: false});
    });
  }

  updateField(key, value) {
    this.setState(prev => ({grade: {...prev.grade, [key]: value}}));
  }

  save() {
    const {grade} = this.state;
    GradeBackend.updateGrade(grade.owner, grade.name, grade).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "保存成功");
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  render() {
    const {grade, schools, loading} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 300}}>
          <Spin size="large" />
        </div>
      );
    }

    if (!grade) return null;

    return (
      <div style={{padding: 24}}>
        <Card
          title="编辑年级"
          extra={
            <Button onClick={() => this.props.history.goBack()}>返回</Button>
          }
          style={{maxWidth: 800}}
        >
          <Form layout="vertical">
            <Form.Item label="所有者">
              <Input value={grade.owner} disabled />
            </Form.Item>
            <Form.Item label="名称">
              <Input value={grade.name} disabled />
            </Form.Item>
            <Form.Item label="显示名">
              <Input
                value={grade.displayName}
                onChange={e => this.updateField("displayName", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="学校">
              <Select
                value={grade.school}
                onChange={v => this.updateField("school", v)}
                allowClear
                placeholder="选择学校"
                options={schools.map(s => ({value: s.name, label: s.displayName || s.name}))}
              />
            </Form.Item>
            <Form.Item label="年份">
              <InputNumber
                value={grade.year}
                onChange={v => this.updateField("year", v)}
                min={2000}
                max={2100}
                style={{width: "100%"}}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={() => this.save()}>
                保存
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }
}

export default GradeEditPage;
