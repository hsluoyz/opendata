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
import * as TeacherBackend from "./backend/TeacherBackend";
import * as SchoolBackend from "./backend/SchoolBackend";
import * as Setting from "./Setting";

class TeacherEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      teacher: null,
      schools: [],
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    const {owner, name} = this.props.match.params;
    Promise.all([
      TeacherBackend.getTeacher(owner, name),
      SchoolBackend.getSchools("admin", 1, 1000, "", "", "", ""),
    ]).then(([teacherRes, schoolRes]) => {
      if (teacherRes.status === "ok") {this.setState({teacher: teacherRes.data});} else {Setting.showMessage("error", teacherRes.msg);}
      if (schoolRes.status === "ok") {this.setState({schools: schoolRes.data || []});}
      this.setState({loading: false});
    });
  }

  updateField(key, value) {
    this.setState(prev => ({teacher: {...prev.teacher, [key]: value}}));
  }

  save() {
    const {teacher} = this.state;
    TeacherBackend.updateTeacher(teacher.owner, teacher.name, teacher).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "保存成功");
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  render() {
    const {teacher, schools, loading} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 300}}>
          <Spin size="large" />
        </div>
      );
    }

    if (!teacher) {return null;}

    return (
      <div style={{padding: 24}}>
        <Card
          title="编辑教师"
          extra={
            <Button onClick={() => this.props.history.goBack()}>返回</Button>
          }
          style={{maxWidth: 800}}
        >
          <Form layout="vertical">
            <Form.Item label="所有者">
              <Input value={teacher.owner} disabled />
            </Form.Item>
            <Form.Item label="名称">
              <Input value={teacher.name} disabled />
            </Form.Item>
            <Form.Item label="显示名">
              <Input
                value={teacher.displayName}
                onChange={e => this.updateField("displayName", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="学校">
              <Select
                value={teacher.school}
                onChange={v => this.updateField("school", v)}
                allowClear
                placeholder="选择学校"
                options={schools.map(s => ({value: s.name, label: s.displayName || s.name}))}
              />
            </Form.Item>
            <Form.Item label="职称">
              <Input
                value={teacher.title}
                onChange={e => this.updateField("title", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="性别">
              <Select
                value={teacher.gender}
                onChange={v => this.updateField("gender", v)}
                options={[
                  {value: "男", label: "男"},
                  {value: "女", label: "女"},
                ]}
              />
            </Form.Item>
            <Form.Item label="电话">
              <Input
                value={teacher.phone}
                onChange={e => this.updateField("phone", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="邮箱">
              <Input
                value={teacher.email}
                onChange={e => this.updateField("email", e.target.value)}
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

export default TeacherEditPage;
