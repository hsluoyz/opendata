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
import {StyleProvider, legacyLogicalPropertiesTransformer} from "@ant-design/cssinjs";
import {ConfigProvider} from "antd";
import zhCN from "antd/es/locale/zh_CN";
import {Helmet} from "react-helmet";
import {AiDots} from "./common/Loading";
import * as AccountBackend from "./backend/AccountBackend";
import * as Conf from "./Conf";
import * as Setting from "./Setting";
import {getShadcnThemeComponents, getShadcnThemeToken} from "./shadcnTheme";
import AuthCallback from "./AuthCallback";
import SigninPage from "./SigninPage";
import ManagementPage from "./ManagementPage";
import "./App.less";

class App extends React.Component {
  constructor(props) {
    super(props);
    const themeAlgorithm = ["default"];
    document.documentElement.setAttribute("data-theme", "light");
    Setting.initServerUrl();
    Setting.initWebConfig();
    Setting.initCasdoorSdk(Conf.AuthConfig);
    Setting.setThemeColor(Conf.ThemeDefault.colorPrimary);
    this.state = {
      account: undefined,
      loading: true,
      themeAlgorithm,
    };
  }

  UNSAFE_componentWillMount() {
    this.getAccount();
  }

  getAccount() {
    AccountBackend.getAccount().then(res => {
      // Re-init after getAccount sets the web config cookie
      Setting.initWebConfig();
      Setting.initCasdoorSdk(Conf.AuthConfig);
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
    const {account, loading, themeAlgorithm} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
          <AiDots size="large" />
        </div>
      );
    }

    return (
      <>
        <Helmet>
          <title>{Setting.getHtmlTitle()}</title>
          <link rel="icon" href={Setting.getFaviconUrl(themeAlgorithm)} />
        </Helmet>
        <ConfigProvider
          locale={zhCN}
          spin={{indicator: <AiDots />}}
          theme={{
            token: {
              ...getShadcnThemeToken(false),
              colorPrimary: Conf.ThemeDefault.colorPrimary,
              colorInfo: Conf.ThemeDefault.colorPrimary,
              borderRadius: Conf.ThemeDefault.borderRadius,
            },
            components: getShadcnThemeComponents(false),
          }}
        >
          <StyleProvider hashPriority="high" transformers={[legacyLogicalPropertiesTransformer]}>
            <BrowserRouter>
              <Switch>
                <Route exact path="/callback" component={AuthCallback} />
                <Route path="/signin" render={props => (
                  account ? <Redirect to="/" /> : <SigninPage {...props} />
                )} />
                <Route path="/" render={props => {
                  if (!account) {
                    return <Redirect to="/signin" />;
                  }
                  return (
                    <ManagementPage
                      {...props}
                      account={account}
                      themeAlgorithm={themeAlgorithm}
                      onSignout={() => this.updateAccount(null)}
                    />
                  );
                }} />
              </Switch>
            </BrowserRouter>
          </StyleProvider>
        </ConfigProvider>
      </>
    );
  }
}

export default App;
