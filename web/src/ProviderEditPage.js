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
import {Button, Card, Col, Input, Row, Select, Switch} from "antd";
import {LinkOutlined} from "@ant-design/icons";
import Loading from "./common/Loading";
import * as ProviderBackend from "./backend/ProviderBackend";
import * as Setting from "./Setting";

class ProviderEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      providerName: props.match.params.providerName,
      provider: null,
      isNewProvider: props.location?.state?.isNewProvider || false,
    };
  }

  UNSAFE_componentWillMount() {
    this.getProvider();
  }

  getProvider() {
    ProviderBackend.getProvider("admin", this.state.providerName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({provider: {...res.data, category: "Storage"}});
        } else {
          Setting.showMessage("error", `Failed to get: ${res.msg}`);
        }
      });
  }

  updateProviderField(key, value) {
    this.setState({
      provider: {
        ...this.state.provider,
        [key]: value,
        category: "Storage",
      },
    });
  }

  submitProviderEdit(exitAfterSave) {
    const provider = {
      ...Setting.deepCopy(this.state.provider),
      owner: this.state.provider.owner || "admin",
      category: "Storage",
    };
    ProviderBackend.updateProvider(provider.owner, this.state.providerName, provider)
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "Successfully saved");
          this.setState({
            providerName: provider.name,
            isNewProvider: false,
          });
          this.props.history.push(exitAfterSave ? "/providers" : `/providers/${provider.name}`);
        } else {
          Setting.showMessage("error", `Failed to save: ${res.msg}`);
        }
      });
  }

  cancelProviderEdit() {
    if (!this.state.isNewProvider) {
      this.props.history.push("/providers");
      return;
    }
    ProviderBackend.deleteProvider(this.state.provider)
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "Cancelled successfully");
          this.props.history.push("/providers");
        } else {
          Setting.showMessage("error", `Failed to cancel: ${res.msg}`);
        }
      });
  }

  renderProvider() {
    const provider = this.state.provider;
    return (
      <Card size="small" title={
        <div>
          Edit Storage Provider&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitProviderEdit(false)}>Save</Button>
          <Button style={{marginLeft: 20}} type="primary" onClick={() => this.submitProviderEdit(true)}>Save & Exit</Button>
          {this.state.isNewProvider && <Button style={{marginLeft: 20}} onClick={() => this.cancelProviderEdit()}>Cancel</Button>}
        </div>
      } style={{marginLeft: 5}} type="inner">
        <Row style={{marginTop: 10}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>{Setting.getLabel("Name", "Unique provider name")} :</Col>
          <Col span={22}><Input value={provider.name} onChange={e => this.updateProviderField("name", e.target.value)} /></Col>
        </Row>
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>{Setting.getLabel("Display name", "Human-readable provider name")} :</Col>
          <Col span={22}><Input value={provider.displayName || ""} onChange={e => this.updateProviderField("displayName", e.target.value)} /></Col>
        </Row>
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>{Setting.getLabel("Category", "Only Storage is supported in OpenData")} :</Col>
          <Col span={22}><Select disabled style={{width: "100%"}} value="Storage" options={[{value: "Storage", label: "Storage"}]} /></Col>
        </Row>
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>{Setting.getLabel("Type", "Storage provider type")} :</Col>
          <Col span={22}>
            <Select
              virtual={false}
              style={{width: "100%"}}
              value={provider.type}
              onChange={value => this.updateProviderField("type", value)}
              options={Setting.getProviderTypeOptions("Storage").map(item => Setting.getOption(item.id, item.name))}
            />
          </Col>
        </Row>
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>{Setting.getLabel("Storage subpath", "Local path, bucket, or provider-specific storage path")} :</Col>
          <Col span={22}><Input value={provider.clientId || ""} onChange={e => this.updateProviderField("clientId", e.target.value)} /></Col>
        </Row>
        {provider.type === "OpenAI File System" || provider.type === "Casdoor" ? (
          <Row style={{marginTop: 20}}>
            <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>{Setting.getLabel("Secret key", "Provider secret key")} :</Col>
            <Col span={22}><Input.Password value={provider.clientSecret || ""} onChange={e => this.updateProviderField("clientSecret", e.target.value)} /></Col>
          </Row>
        ) : null}
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>{Setting.getLabel("Region", "Storage region")} :</Col>
          <Col span={22}><Input value={provider.region || ""} onChange={e => this.updateProviderField("region", e.target.value)} /></Col>
        </Row>
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>{Setting.getLabel("Provider URL", "Storage provider endpoint")} :</Col>
          <Col span={22}><Input prefix={<LinkOutlined />} value={provider.providerUrl || ""} onChange={e => this.updateProviderField("providerUrl", e.target.value)} /></Col>
        </Row>
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>{Setting.getLabel("Is default", "Use this provider by default")} :</Col>
          <Col span={1}><Switch checked={provider.isDefault} onChange={checked => this.updateProviderField("isDefault", checked)} /></Col>
        </Row>
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>{Setting.getLabel("State", "Provider state")} :</Col>
          <Col span={22}>
            <Select
              virtual={false}
              style={{width: "100%"}}
              value={provider.state || "Active"}
              onChange={value => this.updateProviderField("state", value)}
              options={[{value: "Active", label: "Active"}, {value: "Inactive", label: "Inactive"}]}
            />
          </Col>
        </Row>
      </Card>
    );
  }

  render() {
    return (
      <div>
        {this.state.provider !== null ? this.renderProvider() : <Loading type="page" tip="Loading" />}
        {this.state.provider !== null && (
          <div style={{marginTop: 20, marginLeft: 40}}>
            <Button size="large" onClick={() => this.submitProviderEdit(false)}>Save</Button>
            <Button style={{marginLeft: 20}} type="primary" size="large" onClick={() => this.submitProviderEdit(true)}>Save & Exit</Button>
            {this.state.isNewProvider && <Button style={{marginLeft: 20}} size="large" onClick={() => this.cancelProviderEdit()}>Cancel</Button>}
          </div>
        )}
      </div>
    );
  }
}

export default ProviderEditPage;
