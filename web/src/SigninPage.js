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
import {Button, Card, Form, Input} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import * as AccountBackend from "./backend/AccountBackend";
import * as Setting from "./Setting";

class SigninPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  onFinish(values) {
    this.setState({loading: true});
    AccountBackend.signin(values.username, values.password).then(res => {
      this.setState({loading: false});
      if (res.status === "ok") {
        Setting.showMessage("success", "登录成功");
        if (this.props.onSignin) {
          this.props.onSignin(res.data);
        }
        this.props.history.push("/");
      } else {
        Setting.showMessage("error", res.msg || "用户名或密码错误");
      }
    }).catch(() => {
      this.setState({loading: false});
      Setting.showMessage("error", "登录失败，请重试");
    });
  }

  render() {
    const {loading} = this.state;

    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}>
        <Card
          style={{width: 400, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)"}}
          bordered={false}
        >
          <div style={{textAlign: "center", marginBottom: 32}}>
            <h2 style={{fontSize: 24, fontWeight: 700, color: "#1677ff", margin: 0}}>OpenData</h2>
            <p style={{color: "#888", marginTop: 8}}>数据管理系统</p>
          </div>
          <Form
            name="signin"
            onFinish={(values) => this.onFinish(values)}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{required: true, message: "请输入用户名"}]}
            >
              <Input
                prefix={<UserOutlined style={{color: "#bbb"}} />}
                placeholder="用户名"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{required: true, message: "请输入密码"}]}
            >
              <Input.Password
                prefix={<LockOutlined style={{color: "#bbb"}} />}
                placeholder="密码"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{height: 44, fontSize: 16}}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }
}

export default SigninPage;
