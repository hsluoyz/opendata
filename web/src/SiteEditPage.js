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
import {Button, Card, Col, Image, Input, Row, Space} from "antd";
import {LinkOutlined} from "@ant-design/icons";
import * as SiteBackend from "./backend/SiteBackend";
import * as Setting from "./Setting";
import {ThemeDefault} from "./Conf";
import Loading from "./common/Loading";

class SiteEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      siteName: props.match.params.siteName,
      site: null,
    };
  }

  UNSAFE_componentWillMount() {
    this.getSite();
  }

  getSite() {
    SiteBackend.getSite("admin", this.state.siteName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({site: res.data});
        } else {
          Setting.showMessage("error", `获取站点失败: ${res.msg}`);
        }
      });
  }

  updateSiteField(key, value) {
    const site = Setting.deepCopy(this.state.site);
    site[key] = value;
    this.setState({site});
  }

  submitSiteEdit(exitAfterSave) {
    SiteBackend.updateSite(this.state.site.owner, this.state.siteName, this.state.site)
      .then((res) => {
        if (res.status === "ok") {
          if (res.data) {
            Setting.showMessage("success", "保存成功");
            this.setState({siteName: this.state.site.name});
            if (exitAfterSave) {
              this.props.history.push("/sites");
            } else {
              this.props.history.push(`/sites/${this.state.site.name}`);
            }
          } else {
            Setting.showMessage("error", "保存失败");
            this.updateSiteField("name", this.state.siteName);
          }
        } else {
          Setting.showMessage("error", `保存失败: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `保存失败: ${error}`);
      });
  }

  renderSite() {
    const {site} = this.state;
    return (
      <Card
        size="small"
        title={
          <div>
            编辑站点&nbsp;&nbsp;&nbsp;&nbsp;
            <Button onClick={() => this.submitSiteEdit(false)}>保存</Button>
            <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitSiteEdit(true)}>保存并退出</Button>
          </div>
        }
        style={{marginLeft: "5px"}}
        type="inner"
      >
        <Row style={{marginTop: "10px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            名称:
          </Col>
          <Col span={22}>
            <Input
              value={site.name}
              disabled={site.name === "site-built-in"}
              onChange={e => this.updateSiteField("name", e.target.value)}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            显示名称:
          </Col>
          <Col span={22}>
            <Input
              value={site.displayName}
              onChange={e => this.updateSiteField("displayName", e.target.value)}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            主题色:
          </Col>
          <Col span={22}>
            <input
              type="color"
              value={site.themeColor || ThemeDefault.colorPrimary}
              onChange={e => this.updateSiteField("themeColor", e.target.value)}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            HTML标题:
          </Col>
          <Col span={22}>
            <Input
              value={site.htmlTitle}
              onChange={e => this.updateSiteField("htmlTitle", e.target.value)}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            Favicon URL:
          </Col>
          <Col span={22}>
            <Space direction="vertical" style={{width: "100%"}}>
              <Input
                prefix={<LinkOutlined />}
                value={site.faviconUrl}
                onChange={e => this.updateSiteField("faviconUrl", e.target.value)}
              />
              {site.faviconUrl ? (
                <Image src={site.faviconUrl} alt={site.faviconUrl} height={90} preview={{mask: "预览"}} />
              ) : null}
            </Space>
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            Logo URL:
          </Col>
          <Col span={22}>
            <Space direction="vertical" style={{width: "100%"}}>
              <Input
                prefix={<LinkOutlined />}
                value={site.logoUrl}
                onChange={e => this.updateSiteField("logoUrl", e.target.value)}
              />
              {site.logoUrl ? (
                <Image src={site.logoUrl} alt={site.logoUrl} height={90} preview={{mask: "预览"}} />
              ) : null}
            </Space>
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            页脚HTML:
          </Col>
          <Col span={22}>
            <Input.TextArea
              rows={4}
              value={site.footerHtml}
              onChange={e => this.updateSiteField("footerHtml", e.target.value)}
            />
          </Col>
        </Row>
      </Card>
    );
  }

  render() {
    return (
      <div>
        {this.state.site !== null ? this.renderSite() : <Loading type="page" tip="加载中..." />}
        {this.state.site !== null && (
          <div style={{marginTop: "20px", marginLeft: "40px"}}>
            <Button size="large" onClick={() => this.submitSiteEdit(false)}>保存</Button>
            <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitSiteEdit(true)}>保存并退出</Button>
          </div>
        )}
      </div>
    );
  }
}

export default SiteEditPage;
