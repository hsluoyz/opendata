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
import {Button, Card, Form, Input, Select, Spin} from "antd";
import * as ClassBackend from "./backend/ClassBackend";
import * as SchoolBackend from "./backend/SchoolBackend";
import * as GradeBackend from "./backend/GradeBackend";
import * as Setting from "./Setting";

class ClassEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cls: null,
      schools: [],
      grades: [],
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    const {owner, name} = this.props.match.params;
    Promise.all([
      ClassBackend.getClass(owner, name),
      SchoolBackend.getSchools("admin", 1, 1000, "", "", "", ""),
      GradeBackend.getGrades(owner, 1, 1000, "", "", "", ""),
    ]).then(([clsRes, schoolRes, gradeRes]) => {
      if (clsRes.status === "ok") {
        this.setState({cls: clsRes.data});
      } else {
        Setting.showMessage("error", clsRes.msg);
      }
      if (schoolRes.status === "ok") {
        this.setState({schools: schoolRes.data || []});
      }
      if (gradeRes.status === "ok") {
        this.setState({grades: gradeRes.data || []});
      }
      this.setState({loading: false});
    });
  }

  updateField(key, value) {
    this.setState(prev => ({cls: {...prev.cls, [key]: value}}));
  }

  save() {
    const {cls} = this.state;
    ClassBackend.updateClass(cls.owner, cls.name, cls).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "保存成功");
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  render() {
    const {cls, schools, grades, loading} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 300}}>
          <Spin size="large" />
        </div>
      );
    }

    if (!cls) {return null;}

    const filteredGrades = cls.school
      ? grades.filter(g => g.school === cls.school || !g.school)
      : grades;

    return (
      <div style={{padding: 24}}>
        <Card
          title="编辑班级"
          extra={
            <Button onClick={() => this.props.history.goBack()}>返回</Button>
          }
          style={{maxWidth: 800}}
        >
          <Form layout="vertical">
            <Form.Item label="所有者">
              <Input value={cls.owner} disabled />
            </Form.Item>
            <Form.Item label="名称">
              <Input value={cls.name} disabled />
            </Form.Item>
            <Form.Item label="显示名">
              <Input
                value={cls.displayName}
                onChange={e => this.updateField("displayName", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="学校">
              <Select
                value={cls.school}
                onChange={v => this.updateField("school", v)}
                allowClear
                placeholder="选择学校"
                options={schools.map(s => ({value: s.name, label: s.displayName || s.name}))}
              />
            </Form.Item>
            <Form.Item label="年级">
              <Select
                value={cls.grade}
                onChange={v => this.updateField("grade", v)}
                allowClear
                placeholder="选择年级"
                options={filteredGrades.map(g => ({value: g.name, label: g.displayName || g.name}))}
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

export default ClassEditPage;
