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
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {ConfigProvider, Spin} from "antd";
import zhCN from "antd/locale/zh_CN";
import * as AccountBackend from "./backend/AccountBackend";
import * as Conf from "./Conf";
import SigninPage from "./SigninPage";
import ManagementPage from "./ManagementPage";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: undefined,
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    this.getAccount();
  }

  getAccount() {
    AccountBackend.getAccount().then(res => {
      if (res.status === "ok") {
        this.setState({account: res.data, loading: false});
      } else {
        this.setState({account: null, loading: false});
      }
    }).catch(() => {
      this.setState({account: null, loading: false});
    });
  }

  updateAccount(account) {
    this.setState({account});
  }

  render() {
    const {account, loading} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
          <Spin size="large" tip="加载中..." />
        </div>
      );
    }

    return (
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: Conf.ThemeDefault.colorPrimary,
            borderRadius: Conf.ThemeDefault.borderRadius,
          },
        }}
      >
        <BrowserRouter>
          <Switch>
            <Route path="/signin" render={props => (
              <SigninPage {...props} onSignin={(acc) => this.updateAccount(acc)} />
            )} />
            <Route path="/" render={props => {
              if (!account) {
                return <Redirect to="/signin" />;
              }
              return (
                <ManagementPage
                  {...props}
                  account={account}
                  onSignout={() => this.updateAccount(null)}
                />
              );
            }} />
          </Switch>
        </BrowserRouter>
      </ConfigProvider>
    );
  }
}

export default App;
