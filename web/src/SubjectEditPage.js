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
import * as SubjectBackend from "./backend/SubjectBackend";
import * as SchoolBackend from "./backend/SchoolBackend";
import * as GradeBackend from "./backend/GradeBackend";
import * as ClassBackend from "./backend/ClassBackend";
import * as TeacherBackend from "./backend/TeacherBackend";
import * as Setting from "./Setting";

class SubjectEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subject: null,
      schools: [],
      grades: [],
      classes: [],
      teachers: [],
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    const {owner, name} = this.props.match.params;
    Promise.all([
      SubjectBackend.getSubject(owner, name),
      SchoolBackend.getSchools("admin", 1, 1000, "", "", "", ""),
      GradeBackend.getGrades(owner, 1, 1000, "", "", "", ""),
      ClassBackend.getClasses(owner, 1, 1000, "", "", "", ""),
      TeacherBackend.getTeachers(owner, 1, 1000, "", "", "", ""),
    ]).then(([subRes, schoolRes, gradeRes, classRes, teacherRes]) => {
      if (subRes.status === "ok") {this.setState({subject: subRes.data});} else {Setting.showMessage("error", subRes.msg);}
      if (schoolRes.status === "ok") {this.setState({schools: schoolRes.data || []});}
      if (gradeRes.status === "ok") {this.setState({grades: gradeRes.data || []});}
      if (classRes.status === "ok") {this.setState({classes: classRes.data || []});}
      if (teacherRes.status === "ok") {this.setState({teachers: teacherRes.data || []});}
      this.setState({loading: false});
    });
  }

  updateField(key, value) {
    this.setState(prev => ({subject: {...prev.subject, [key]: value}}));
  }

  save(exitAfterSave = false) {
    const {subject} = this.state;
    SubjectBackend.updateSubject(subject.owner, subject.name, subject).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "保存成功");
        if (exitAfterSave) {
          this.props.history.push("/subjects");
        }
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  render() {
    const {subject, schools, grades, classes, teachers, loading} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 300}}>
          <Spin size="large" />
        </div>
      );
    }

    if (!subject) {return null;}

    return (
      <div>
        <Card
          size="small"
          title={
            <div>
              编辑学科&nbsp;&nbsp;&nbsp;&nbsp;
              <Button onClick={() => this.save(false)}>保存</Button>
              <Button style={{marginLeft: 20}} type="primary" onClick={() => this.save(true)}>保存并退出</Button>
            </div>
          }
          style={{marginLeft: 5}}
          type="inner"
        >
          <Form layout="vertical">
            <Form.Item label="所有者">
              <Input value={subject.owner} disabled />
            </Form.Item>
            <Form.Item label="名称">
              <Input value={subject.name} disabled />
            </Form.Item>
            <Form.Item label="显示名">
              <Input
                value={subject.displayName}
                onChange={e => this.updateField("displayName", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="学校">
              <Select
                value={subject.school}
                onChange={v => this.updateField("school", v)}
                allowClear
                placeholder="选择学校"
                options={schools.map(s => ({value: s.name, label: s.displayName || s.name}))}
              />
            </Form.Item>
            <Form.Item label="年级">
              <Select
                value={subject.grade}
                onChange={v => this.updateField("grade", v)}
                allowClear
                placeholder="选择年级"
                options={grades.map(g => ({value: g.name, label: g.displayName || g.name}))}
              />
            </Form.Item>
            <Form.Item label="班级">
              <Select
                value={subject.class}
                onChange={v => this.updateField("class", v)}
                allowClear
                placeholder="选择班级"
                options={classes.map(c => ({value: c.name, label: c.displayName || c.name}))}
              />
            </Form.Item>
            <Form.Item label="教师">
              <Select
                value={subject.teacher}
                onChange={v => this.updateField("teacher", v)}
                allowClear
                placeholder="选择教师"
                options={teachers.map(t => ({value: t.name, label: t.displayName || t.name}))}
              />
            </Form.Item>
          </Form>
        </Card>
        <div style={{marginTop: 20, marginLeft: 40}}>
          <Button size="large" onClick={() => this.save(false)}>保存</Button>
          <Button style={{marginLeft: 20}} type="primary" size="large" onClick={() => this.save(true)}>保存并退出</Button>
        </div>
      </div>
    );
  }
}

export default SubjectEditPage;
