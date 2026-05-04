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
import * as StudentBackend from "./backend/StudentBackend";
import * as SchoolBackend from "./backend/SchoolBackend";
import * as GradeBackend from "./backend/GradeBackend";
import * as ClassBackend from "./backend/ClassBackend";
import * as ParentBackend from "./backend/ParentBackend";
import * as Setting from "./Setting";

class StudentEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      student: null,
      schools: [],
      grades: [],
      classes: [],
      parents: [],
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    const {owner, name} = this.props.match.params;
    Promise.all([
      StudentBackend.getStudent(owner, name),
      SchoolBackend.getSchools("admin", 1, 1000, "", "", "", ""),
      GradeBackend.getGrades(owner, 1, 1000, "", "", "", ""),
      ClassBackend.getClasses(owner, 1, 1000, "", "", "", ""),
      ParentBackend.getParents(owner, 1, 1000, "", "", "", ""),
    ]).then(([stuRes, schoolRes, gradeRes, classRes, parentRes]) => {
      if (stuRes.status === "ok") {this.setState({student: stuRes.data});} else {Setting.showMessage("error", stuRes.msg);}
      if (schoolRes.status === "ok") {this.setState({schools: schoolRes.data || []});}
      if (gradeRes.status === "ok") {this.setState({grades: gradeRes.data || []});}
      if (classRes.status === "ok") {this.setState({classes: classRes.data || []});}
      if (parentRes.status === "ok") {this.setState({parents: parentRes.data || []});}
      this.setState({loading: false});
    });
  }

  updateField(key, value) {
    this.setState(prev => ({student: {...prev.student, [key]: value}}));
  }

  save() {
    const {student} = this.state;
    StudentBackend.updateStudent(student.owner, student.name, student).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "保存成功");
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  render() {
    const {student, schools, grades, classes, parents, loading} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 300}}>
          <Spin size="large" />
        </div>
      );
    }

    if (!student) {return null;}

    const filteredGrades = student.school
      ? grades.filter(g => g.school === student.school || !g.school)
      : grades;

    const filteredClasses = student.grade
      ? classes.filter(c => c.grade === student.grade || !c.grade)
      : classes;

    return (
      <div style={{padding: 24}}>
        <Card
          title="编辑学生"
          extra={
            <Button onClick={() => this.props.history.goBack()}>返回</Button>
          }
          style={{maxWidth: 800}}
        >
          <Form layout="vertical">
            <Form.Item label="所有者">
              <Input value={student.owner} disabled />
            </Form.Item>
            <Form.Item label="名称">
              <Input value={student.name} disabled />
            </Form.Item>
            <Form.Item label="显示名">
              <Input
                value={student.displayName}
                onChange={e => this.updateField("displayName", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="学号">
              <Input
                value={student.studentId}
                onChange={e => this.updateField("studentId", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="学校">
              <Select
                value={student.school}
                onChange={v => this.updateField("school", v)}
                allowClear
                placeholder="选择学校"
                options={schools.map(s => ({value: s.name, label: s.displayName || s.name}))}
              />
            </Form.Item>
            <Form.Item label="年级">
              <Select
                value={student.grade}
                onChange={v => this.updateField("grade", v)}
                allowClear
                placeholder="选择年级"
                options={filteredGrades.map(g => ({value: g.name, label: g.displayName || g.name}))}
              />
            </Form.Item>
            <Form.Item label="班级">
              <Select
                value={student.class}
                onChange={v => this.updateField("class", v)}
                allowClear
                placeholder="选择班级"
                options={filteredClasses.map(c => ({value: c.name, label: c.displayName || c.name}))}
              />
            </Form.Item>
            <Form.Item label="性别">
              <Select
                value={student.gender}
                onChange={v => this.updateField("gender", v)}
                options={[
                  {value: "男", label: "男"},
                  {value: "女", label: "女"},
                ]}
              />
            </Form.Item>
            <Form.Item label="出生日期">
              <Input
                value={student.birthDate}
                onChange={e => this.updateField("birthDate", e.target.value)}
                placeholder="例如: 2010-01-01"
              />
            </Form.Item>
            <Form.Item label="地址">
              <Input
                value={student.address}
                onChange={e => this.updateField("address", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="电话">
              <Input
                value={student.phone}
                onChange={e => this.updateField("phone", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="家长">
              <Select
                mode="multiple"
                value={student.parents || []}
                onChange={v => this.updateField("parents", v)}
                placeholder="选择家长"
                options={parents.map(p => ({value: p.name, label: p.displayName || p.name}))}
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

export default StudentEditPage;
