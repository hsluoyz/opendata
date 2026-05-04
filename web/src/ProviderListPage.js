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
import {Button, Popconfirm, Switch, Table} from "antd";
import moment from "moment";
import {DeleteOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import BaseListPage from "./BaseListPage";
import * as Setting from "./Setting";
import * as ProviderBackend from "./backend/ProviderBackend";
import * as Provider from "./Provider";

class ProviderListPage extends BaseListPage {
  newStorageProvider() {
    const randomName = Setting.getRandomName();
    return {
      owner: "admin",
      name: `provider_${randomName}`,
      createdTime: moment().format(),
      displayName: `新存储提供商 - ${randomName}`,
      displayName2: "",
      category: "Storage",
      type: "Local File System",
      subType: "",
      clientId: "",
      clientSecret: "",
      regionId: "",
      intranetEndpoint: "",
      endpoint: "",
      bucket: "",
      pathPrefix: "",
      domain: Setting.getFullServerUrl(),
      content: "",
      providerUrl: "",
      state: "Active",
      isDefault: false,
      isRemote: false,
    };
  }

  addProvider() {
    const newProvider = this.newStorageProvider();
    ProviderBackend.addProvider(newProvider)
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "添加成功");
          this.props.history.push({
            pathname: `/providers/${newProvider.name}`,
            state: {isNewProvider: true},
          });
        } else {
          Setting.showMessage("error", `添加失败：${res.msg}`);
        }
      });
  }

  deleteItem = async(i) => {
    return ProviderBackend.deleteProvider(this.state.data[i]);
  };

  deleteProvider(record) {
    ProviderBackend.deleteProvider(record)
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
          Setting.showMessage("error", `删除失败：${res.msg}`);
        }
      });
  }

  renderTable(providers) {
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: "180px",
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...this.getColumnSearchProps("name"),
        render: (text) => <Link to={`/providers/${text}`}>{text}</Link>,
      },
      {
        title: "显示名称",
        dataIndex: "displayName",
        key: "displayName",
        width: "220px",
        sorter: (a, b) => Setting.getProviderDisplayName(a).localeCompare(Setting.getProviderDisplayName(b)),
        ...this.getColumnSearchProps("displayName"),
        render: (text, record) => {
          const visible = Setting.getProviderDisplayName(record);
          return this.state.searchedColumn === "displayName" ? (
            <Highlighter highlightStyle={{backgroundColor: "#ffc069", padding: 0}} searchWords={[this.state.searchText]} autoEscape textToHighlight={visible} />
          ) : visible;
        },
      },
      {
        title: "类别",
        dataIndex: "category",
        key: "category",
        width: "110px",
        filters: [{text: "存储", value: "Storage"}],
        filterMultiple: false,
        sorter: (a, b) => a.category.localeCompare(b.category),
        render: (text) => Setting.getProviderCategoryDisplayName(text),
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        width: "150px",
        align: "center",
        filters: Setting.getProviderTypeOptions("Storage").map((o) => ({text: o.name, value: o.id})),
        filterMultiple: false,
        sorter: (a, b) => a.type.localeCompare(b.type),
        render: (text, record) => Provider.getProviderLogoWidget(record),
      },
      {
        title: "Client ID",
        dataIndex: "clientId",
        key: "clientId",
        width: "160px",
        ellipsis: true,
        sorter: (a, b) => (a.clientId || "").localeCompare(b.clientId || ""),
        ...this.getColumnSearchProps("clientId"),
      },
      {
        title: "Domain",
        dataIndex: "domain",
        key: "domain",
        width: "220px",
        ellipsis: true,
        sorter: (a, b) => (a.domain || "").localeCompare(b.domain || ""),
        ...this.getColumnSearchProps("domain"),
      },
      {
        title: "Region ID",
        dataIndex: "regionId",
        key: "regionId",
        width: "140px",
        sorter: (a, b) => (a.regionId || "").localeCompare(b.regionId || ""),
        ...this.getColumnSearchProps("regionId"),
      },
      {
        title: "默认",
        dataIndex: "isDefault",
        key: "isDefault",
        width: "120px",
        sorter: (a, b) => a.isDefault - b.isDefault,
        render: (text) => <Switch disabled checkedChildren="是" unCheckedChildren="否" checked={text} />,
      },
      {
        title: "状态",
        dataIndex: "state",
        key: "state",
        width: "90px",
        sorter: (a, b) => (a.state || "").localeCompare(b.state || ""),
        render: (text) => Setting.getProviderStateDisplayName(text),
      },
      {
        title: "操作",
        dataIndex: "action",
        key: "action",
        width: "180px",
        fixed: "right",
        render: (text, record) => (
          <div>
            <Button style={{marginTop: 10, marginBottom: 10, marginRight: 10}} type="primary" onClick={() => this.props.history.push(`/providers/${record.name}`)}>
              编辑
            </Button>
            <Popconfirm title={`确认删除：${record.name}？`} onConfirm={() => this.deleteProvider(record)} okText="确认" cancelText="取消">
              <Button style={{marginBottom: 10}} type="primary" danger>删除</Button>
            </Popconfirm>
          </div>
        ),
      },
    ];

    const paginationProps = {
      total: this.state.pagination.total,
      showQuickJumper: true,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100", "1000"],
      showTotal: () => `共 ${this.state.pagination.total} 条`,
    };

    return (
      <Table
        scroll={{x: "max-content"}}
        columns={columns}
        dataSource={providers}
        rowKey="name"
        rowSelection={this.getRowSelection()}
        size="middle"
        bordered
        pagination={paginationProps}
        title={() => (
          <div>
            存储提供商&nbsp;&nbsp;&nbsp;&nbsp;
            <Button type="primary" size="small" onClick={() => this.addProvider()}>添加</Button>
            {this.state.selectedRowKeys.length > 0 && (
              <Popconfirm title={`确认删除 ${this.state.selectedRowKeys.length} 项？`} onConfirm={() => this.performBulkDelete(this.state.selectedRows)} okText="确认" cancelText="取消">
                <Button type="primary" danger size="small" icon={<DeleteOutlined />} style={{marginLeft: 8}}>
                  删除（{this.state.selectedRowKeys.length}）
                </Button>
              </Popconfirm>
            )}
          </div>
        )}
        loading={this.getTableLoading()}
        onChange={this.handleTableChange}
      />
    );
  }

  fetch = (params = {}) => {
    let field = params.searchedColumn, value = params.searchText;
    const sortField = params.sortField, sortOrder = params.sortOrder;
    if (params.category !== undefined && params.category !== null) {
      field = "category";
      value = "Storage";
    } else if (params.type !== undefined && params.type !== null) {
      field = "type";
      value = params.type;
    }
    this.setState({loading: true});
    ProviderBackend.getProviders(this.props.account.name, params.pagination.current, params.pagination.pageSize, field, value, sortField, sortOrder)
      .then((res) => {
        this.setState({loading: false});
        if (res.status === "ok") {
          this.setState({
            data: (res.data || []).filter(provider => provider.category === "Storage"),
            pagination: {...params.pagination, total: res.data2},
            searchText: params.searchText,
            searchedColumn: params.searchedColumn,
          });
        } else {
          Setting.showMessage("error", res.msg);
        }
      });
  };
}

export default ProviderListPage;
