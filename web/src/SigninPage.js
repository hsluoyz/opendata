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
import {Result, Spin} from "antd";
import * as Setting from "./Setting";

class SigninPage extends React.Component {
  componentDidMount() {
    const signinUrl = Setting.getSigninUrl();
    if (signinUrl) {
      sessionStorage.setItem("from", this.props.location?.state?.from || "/");
      window.location.replace(signinUrl);
    }
  }

  render() {
    const signinUrl = Setting.getSigninUrl();
    if (!signinUrl) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
          <Result
            status="warning"
            title="登录服务不可用"
            subTitle="Casdoor 单点登录未配置，请检查服务端配置后重试。"
          />
        </div>
      );
    }
    return (
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
        <Spin size="large" tip="正在跳转到登录页面..." />
      </div>
    );
  }
}

export default SigninPage;
