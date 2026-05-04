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
import {Link} from "react-router-dom";
import {Button, Popconfirm, Table} from "antd";
import moment from "moment";
import BaseListPage from "./BaseListPage";
import * as Setting from "./Setting";
import * as SiteBackend from "./backend/SiteBackend";
import {ThemeDefault} from "./Conf";

class SiteListPage extends BaseListPage {
  newSite() {
    const randomName = Setting.getRandomName();
    return {
      owner: "admin",
      name: `site_${randomName}`,
      createdTime: moment().format(),
      displayName: `New Site - ${randomName}`,
      themeColor: ThemeDefault.colorPrimary,
      htmlTitle: "",
      faviconUrl: "",
      logoUrl: "",
      footerHtml: "",
      storageProvider: "",
      navItems: [],
    };
  }

  addSite() {
    const newSite = this.newSite();
    SiteBackend.addSite(newSite)
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "添加成功");
          this.props.history.push(`/sites/${newSite.name}`);
        } else {
          Setting.showMessage("error", `添加失败: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `添加失败: ${error}`);
      });
  }

  deleteSite(record) {
    SiteBackend.deleteSite(record)
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "删除成功");
          this.setState({
            data: this.state.data.filter((item) => item.name !== record.name),
            pagination: {
              ...this.state.pagination,
              total: this.state.pagination.total - 1,
            },
          });
        } else {
          Setting.showMessage("error", `删除失败: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `删除失败: ${error}`);
      });
  }

  renderTable(sites) {
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: "200px",
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text) => (
          <Link to={`/sites/${text}`}>{text}</Link>
        ),
      },
      {
        title: "显示名称",
        dataIndex: "displayName",
        key: "displayName",
        width: "200px",
        sorter: (a, b) => a.displayName.localeCompare(b.displayName),
      },
      {
        title: "主题色",
        dataIndex: "themeColor",
        key: "themeColor",
        width: "120px",
        render: (text) => (
          <span>
            <span style={{display: "inline-block", width: "16px", height: "16px", backgroundColor: text, borderRadius: "3px", marginRight: "8px", verticalAlign: "middle", border: "1px solid #d9d9d9"}} />
            {text}
          </span>
        ),
      },
      {
        title: "创建时间",
        dataIndex: "createdTime",
        key: "createdTime",
        width: "160px",
        sorter: (a, b) => a.createdTime.localeCompare(b.createdTime),
        render: (text) => Setting.getFormattedDate(text),
      },
      {
        title: "操作",
        dataIndex: "action",
        key: "action",
        width: "180px",
        fixed: "right",
        render: (text, record) => (
          <div>
            <Button
              style={{marginTop: "10px", marginBottom: "10px", marginRight: "10px"}}
              type="primary"
              onClick={() => this.props.history.push(`/sites/${record.name}`)}
            >
              编辑
            </Button>
            <Popconfirm
              title={`确认删除: ${record.name} ?`}
              onConfirm={() => this.deleteSite(record)}
              okText="确认"
              cancelText="取消"
              disabled={record.name === "site-built-in"}
            >
              <Button
                style={{marginBottom: "10px"}}
                type="primary"
                danger
                disabled={record.name === "site-built-in"}
              >
                删除
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return (
      <div>
        <Table
          scroll={{x: "max-content"}}
          columns={columns}
          dataSource={sites}
          rowKey="name"
          size="middle"
          bordered
          title={() => (
            <div>
              站点列表&nbsp;&nbsp;&nbsp;&nbsp;
              <Button type="primary" size="small" onClick={() => this.addSite()}>添加</Button>
            </div>
          )}
          loading={this.getTableLoading()}
        />
      </div>
    );
  }

  fetch = (params = {}) => {
    this.setState({loading: true});
    SiteBackend.getGlobalSites()
      .then((res) => {
        this.setState({loading: false});
        if (res.status === "ok") {
          this.setState({
            data: res.data,
            pagination: {
              ...params.pagination,
              total: res.data ? res.data.length : 0,
            },
          });
        } else {
          if (Setting.isResponseDenied(res)) {
            this.setState({isAuthorized: false});
          } else {
            Setting.showMessage("error", res.msg);
          }
        }
      });
  };
}

export default SiteListPage;
