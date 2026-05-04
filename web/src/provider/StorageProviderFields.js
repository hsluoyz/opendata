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
import {Col, Input, Row} from "antd";
import {LinkOutlined} from "@ant-design/icons";
import * as Setting from "../Setting";

// Subset of Casdoor web/src/provider/StorageProviderFields.js for Local File System + Aliyun OSS only.
export function renderStorageProviderFields(provider, updateProviderField) {
  return (
    <React.Fragment>
      {provider.type === "Local File System" ? null : (
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel("内网 Endpoint", "内网访问 OSS 的 Endpoint（可选）")}：
          </Col>
          <Col span={22}>
            <Input
              prefix={<LinkOutlined />}
              value={provider.intranetEndpoint || ""}
              onChange={e => updateProviderField("intranetEndpoint", e.target.value)}
            />
          </Col>
        </Row>
      )}
      {provider.type === "Local File System" ? null : (
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel("Endpoint", "外网访问 OSS 的 Endpoint")}：
          </Col>
          <Col span={22}>
            <Input
              prefix={<LinkOutlined />}
              value={provider.endpoint || ""}
              onChange={e => updateProviderField("endpoint", e.target.value)}
            />
          </Col>
        </Row>
      )}
      {provider.type === "Local File System" ? null : (
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel("Bucket", "OSS Bucket 名称")}：
          </Col>
          <Col span={22}>
            <Input value={provider.bucket || ""} onChange={e => updateProviderField("bucket", e.target.value)} />
          </Col>
        </Row>
      )}
      <Row style={{marginTop: 20}}>
        <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>
          {Setting.getLabel("Path 前缀", "对象键前缀（Casdoor Path prefix）")}：
        </Col>
        <Col span={22}>
          <Input value={provider.pathPrefix || ""} onChange={e => updateProviderField("pathPrefix", e.target.value)} />
        </Col>
      </Row>
      <Row style={{marginTop: 20}}>
        <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>
          {Setting.getLabel("域名", "生成文件 URL 使用的站点域名，本地存储由系统自动填写")}：
        </Col>
        <Col span={22}>
          <Input
            prefix={<LinkOutlined />}
            value={provider.domain || ""}
            disabled={provider.type === "Local File System"}
            onChange={e => updateProviderField("domain", e.target.value)}
          />
        </Col>
      </Row>
      {provider.type === "Aliyun OSS" ? (
        <Row style={{marginTop: 20}}>
          <Col style={{marginTop: 5}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel("Region ID", "例如 oss-cn-hangzhou")}：
          </Col>
          <Col span={22}>
            <Input value={provider.regionId || ""} onChange={e => updateProviderField("regionId", e.target.value)} />
          </Col>
        </Row>
      ) : null}
    </React.Fragment>
  );
}
