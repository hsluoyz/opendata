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
import {Button, Card, Form, Input, Select, Spin} from "antd";
import * as ParentBackend from "./backend/ParentBackend";
import * as SchoolBackend from "./backend/SchoolBackend";
import * as StudentBackend from "./backend/StudentBackend";
import * as Setting from "./Setting";

class ParentEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      parent: null,
      schools: [],
      students: [],
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    const {owner, name} = this.props.match.params;
    Promise.all([
      ParentBackend.getParent(owner, name),
      SchoolBackend.getSchools("admin", 1, 1000, "", "", "", ""),
      StudentBackend.getStudents(owner, 1, 1000, "", "", "", ""),
    ]).then(([parentRes, schoolRes, studentRes]) => {
      if (parentRes.status === "ok") {this.setState({parent: parentRes.data});} else {Setting.showMessage("error", parentRes.msg);}
      if (schoolRes.status === "ok") {this.setState({schools: schoolRes.data || []});}
      if (studentRes.status === "ok") {this.setState({students: studentRes.data || []});}
      this.setState({loading: false});
    });
  }

  updateField(key, value) {
    this.setState(prev => ({parent: {...prev.parent, [key]: value}}));
  }

  save(exitAfterSave = false) {
    const {parent} = this.state;
    ParentBackend.updateParent(parent.owner, parent.name, parent).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "保存成功");
        if (exitAfterSave) {
          this.props.history.push("/parents");
        }
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  render() {
    const {parent, schools, students, loading} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 300}}>
          <Spin size="large" />
        </div>
      );
    }

    if (!parent) {return null;}

    return (
      <div>
        <Helmet><title>{Setting.getPageTitle(this.state.parent?.displayName ? `编辑家长 - ${this.state.parent.displayName}` : "编辑家长")}</title></Helmet>
        <Card
          size="small"
          title={
            <div>
              编辑家长&nbsp;&nbsp;&nbsp;&nbsp;
              <Button onClick={() => this.save(false)}>保存</Button>
              <Button style={{marginLeft: 20}} type="primary" onClick={() => this.save(true)}>保存并退出</Button>
            </div>
          }
          style={{marginLeft: 5}}
          type="inner"
        >
          <Form layout="vertical">
            <Form.Item label="所有者">
              <Input value={parent.owner} disabled />
            </Form.Item>
            <Form.Item label="名称">
              <Input value={parent.name} disabled />
            </Form.Item>
            <Form.Item label="显示名">
              <Input
                value={parent.displayName}
                onChange={e => this.updateField("displayName", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="学校">
              <Select
                value={parent.school}
                onChange={v => this.updateField("school", v)}
                allowClear
                placeholder="选择学校"
                options={schools.map(s => ({value: s.name, label: s.displayName || s.name}))}
              />
            </Form.Item>
            <Form.Item label="性别">
              <Select
                value={parent.gender}
                onChange={v => this.updateField("gender", v)}
                options={[
                  {value: "男", label: "男"},
                  {value: "女", label: "女"},
                ]}
              />
            </Form.Item>
            <Form.Item label="与学生关系">
              <Select
                value={parent.relation}
                onChange={v => this.updateField("relation", v)}
                options={[
                  {value: "父亲", label: "父亲"},
                  {value: "母亲", label: "母亲"},
                  {value: "祖父", label: "祖父"},
                  {value: "祖母", label: "祖母"},
                  {value: "外祖父", label: "外祖父"},
                  {value: "外祖母", label: "外祖母"},
                  {value: "监护人", label: "监护人"},
                  {value: "其他", label: "其他"},
                ]}
              />
            </Form.Item>
            <Form.Item label="关联学生">
              <Select
                value={parent.student}
                onChange={v => this.updateField("student", v)}
                allowClear
                placeholder="选择关联学生"
                options={students.map(s => ({value: s.name, label: s.displayName || s.name}))}
              />
            </Form.Item>
            <Form.Item label="电话">
              <Input
                value={parent.phone}
                onChange={e => this.updateField("phone", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="邮箱">
              <Input
                value={parent.email}
                onChange={e => this.updateField("email", e.target.value)}
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

export default ParentEditPage;
