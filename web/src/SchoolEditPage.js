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
import {Button, Card, Form, Input, Spin} from "antd";
import * as SchoolBackend from "./backend/SchoolBackend";
import * as Setting from "./Setting";

class SchoolEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      school: null,
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    const {owner, name} = this.props.match.params;
    SchoolBackend.getSchool(owner, name).then(res => {
      if (res.status === "ok") {
        this.setState({school: res.data, loading: false});
      } else {
        Setting.showMessage("error", res.msg);
        this.setState({loading: false});
      }
    });
  }

  updateField(key, value) {
    this.setState(prev => ({school: {...prev.school, [key]: value}}));
  }

  save(exitAfterSave = false) {
    const {school} = this.state;
    SchoolBackend.updateSchool(school.owner, school.name, school).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "保存成功");
        if (exitAfterSave) {
          this.props.history.push("/schools");
        }
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  render() {
    const {school, loading} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 300}}>
          <Spin size="large" />
        </div>
      );
    }

    if (!school) {return null;}

    return (
      <div>
        <Helmet><title>{Setting.getPageTitle(this.state.school?.displayName ? `编辑学校 - ${this.state.school.displayName}` : "编辑学校")}</title></Helmet>
        <Card
          size="small"
          title={
            <div>
              编辑学校&nbsp;&nbsp;&nbsp;&nbsp;
              <Button onClick={() => this.save(false)}>保存</Button>
              <Button style={{marginLeft: 20}} type="primary" onClick={() => this.save(true)}>保存并退出</Button>
            </div>
          }
          style={{marginLeft: 5}}
          type="inner"
        >
          <Form layout="vertical">
            <Form.Item label="所有者">
              <Input value={school.owner} disabled />
            </Form.Item>
            <Form.Item label="名称">
              <Input value={school.name} disabled />
            </Form.Item>
            <Form.Item label="显示名">
              <Input
                value={school.displayName}
                onChange={e => this.updateField("displayName", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="地址">
              <Input
                value={school.address}
                onChange={e => this.updateField("address", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="电话">
              <Input
                value={school.phone}
                onChange={e => this.updateField("phone", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Logo 地址">
              <Input
                value={school.logo}
                onChange={e => this.updateField("logo", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="简介">
              <Input.TextArea
                rows={4}
                value={school.description}
                onChange={e => this.updateField("description", e.target.value)}
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

export default SchoolEditPage;
