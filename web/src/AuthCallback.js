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
import {Button, Modal, Result, Spin} from "antd";
import {withRouter} from "react-router-dom";
import * as Setting from "./Setting";

class AuthCallback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      msg: null,
      errorDetails: null,
      showDetailsModal: false,
    };
  }

  UNSAFE_componentWillMount() {
    this.login();
  }

  getFromLink() {
    const from = sessionStorage.getItem("from");
    if (from === null) {
      return "/";
    }
    return from;
  }

  login() {
    Setting.signin().then((res) => {
      if (res.status === "ok") {
        Setting.showMessage("success", "登录成功");
        const link = this.getFromLink();
        sessionStorage.removeItem("from");
        window.location.href = link;
      } else {
        this.setState({
          msg: res.msg,
          errorDetails: res,
        });
      }
    });
  }

  renderErrorDetails() {
    const {errorDetails} = this.state;
    if (!errorDetails) {
      return null;
    }
    const details = [];
    if (errorDetails.msg) {
      details.push({label: "错误信息", value: errorDetails.msg});
    }
    if (errorDetails.data) {
      details.push({
        label: "附加信息",
        value: typeof errorDetails.data === "string" ? errorDetails.data : JSON.stringify(errorDetails.data, null, 2),
      });
    }
    return (
      <div style={{textAlign: "left"}}>
        {details.map((detail, index) => (
          <div key={index} style={{marginBottom: "16px"}}>
            <strong>{detail.label}:</strong>
            <pre style={{marginTop: "8px", padding: "12px", backgroundColor: "#f5f5f5", borderRadius: "4px", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word"}}>
              {detail.value}
            </pre>
          </div>
        ))}
      </div>
    );
  }

  render() {
    return (
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 120px)"}}>
        {this.state.msg === null ? (
          <Spin size="large" tip="正在登录..." />
        ) : (
          <div style={{display: "inline"}}>
            <Result
              status="error"
              title="登录失败"
              subTitle={this.state.msg}
              extra={[
                <Button type="primary" key="details" onClick={() => this.setState({showDetailsModal: true})}>
                  详情
                </Button>,
              ]}
            />
            <Modal
              title="错误详情"
              open={this.state.showDetailsModal}
              onCancel={() => this.setState({showDetailsModal: false})}
              footer={[
                <Button key="close" type="primary" onClick={() => this.setState({showDetailsModal: false})}>
                  关闭
                </Button>,
              ]}
              width={700}
            >
              {this.renderErrorDetails()}
            </Modal>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(AuthCallback);
