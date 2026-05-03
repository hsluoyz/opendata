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
import {Button, Card, Form, Input, Select, Spin, Switch} from "antd";
import * as ProviderBackend from "./backend/ProviderBackend";
import * as Setting from "./Setting";

class ProviderEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      provider: null,
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    const {owner, name} = this.props.match.params;
    ProviderBackend.getProvider(owner, name).then(res => {
      if (res.status === "ok") {
        this.setState({provider: res.data, loading: false});
      } else {
        Setting.showMessage("error", res.msg);
        this.setState({loading: false});
      }
    });
  }

  updateField(key, value) {
    this.setState(prev => ({provider: {...prev.provider, [key]: value}}));
  }

  save() {
    const {provider} = this.state;
    ProviderBackend.updateProvider(provider.owner, provider.name, provider).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "保存成功");
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  render() {
    const {provider, loading} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 300}}>
          <Spin size="large" />
        </div>
      );
    }

    if (!provider) return null;

    return (
      <div style={{padding: 24}}>
        <Card
          title="编辑存储提供商"
          extra={
            <Button onClick={() => this.props.history.goBack()}>返回</Button>
          }
          style={{maxWidth: 800}}
        >
          <Form layout="vertical">
            <Form.Item label="所有者">
              <Input value={provider.owner} disabled />
            </Form.Item>
            <Form.Item label="名称">
              <Input value={provider.name} disabled />
            </Form.Item>
            <Form.Item label="显示名">
              <Input
                value={provider.displayName}
                onChange={e => this.updateField("displayName", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="类别">
              <Select
                value={provider.category}
                onChange={v => this.updateField("category", v)}
                options={[
                  {value: "Storage", label: "存储"},
                ]}
              />
            </Form.Item>
            <Form.Item label="类型">
              <Select
                value={provider.type}
                onChange={v => this.updateField("type", v)}
                options={[
                  {value: "Local File System", label: "本地文件系统"},
                  {value: "AWS S3", label: "AWS S3"},
                  {value: "Alibaba Cloud OSS", label: "阿里云 OSS"},
                  {value: "Tencent Cloud COS", label: "腾讯云 COS"},
                  {value: "MinIO", label: "MinIO"},
                ]}
              />
            </Form.Item>
            <Form.Item label="Client ID / Access Key">
              <Input
                value={provider.clientId}
                onChange={e => this.updateField("clientId", e.target.value)}
                placeholder="Access Key ID 或路径"
              />
            </Form.Item>
            <Form.Item label="是否默认">
              <Switch
                checked={provider.isDefault}
                onChange={v => this.updateField("isDefault", v)}
                checkedChildren="是"
                unCheckedChildren="否"
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

export default ProviderEditPage;
