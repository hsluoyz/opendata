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
import {Helmet} from "react-helmet";
import {Alert, Button, Popconfirm, Table, Typography} from "antd";
import {CloseCircleFilled, DeleteOutlined} from "@ant-design/icons";
import * as Setting from "./Setting";
import * as RecordBackend from "./backend/RecordBackend";
import BaseListPage from "./BaseListPage";

class RecordListPage extends BaseListPage {
  deleteItem = async(i) => {
    return RecordBackend.deleteRecord(this.state.data[i]);
  };

  deleteRecord(i) {
    RecordBackend.deleteRecord(this.state.data[i])
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "删除成功");
          this.setState({
            data: Setting.deleteRow(this.state.data, i),
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

  renderTable(records) {
    const columns = [
      {
        title: "组织",
        dataIndex: "organization",
        key: "organization",
        width: "110px",
        sorter: true,
        ...this.getColumnSearchProps("organization"),
      },
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("id"),
      },
      {
        title: "用户",
        dataIndex: "user",
        key: "user",
        width: "120px",
        sorter: true,
        ...this.getColumnSearchProps("user"),
      },
      {
        title: "客户端IP",
        dataIndex: "clientIp",
        key: "clientIp",
        width: "140px",
        sorter: true,
        ...this.getColumnSearchProps("clientIp"),
        render: (text) => (
          <a target="_blank" rel="noreferrer" href={`https://db-ip.com/${text}`}>{text}</a>
        ),
      },
      {
        title: "创建时间",
        dataIndex: "createdTime",
        key: "createdTime",
        width: "160px",
        sorter: true,
        render: (text) => Setting.getFormattedDate(text),
      },
      {
        title: "方法",
        dataIndex: "method",
        key: "method",
        width: "90px",
        sorter: true,
        filterMultiple: false,
        filters: [
          {text: "GET", value: "GET"},
          {text: "POST", value: "POST"},
          {text: "PUT", value: "PUT"},
          {text: "DELETE", value: "DELETE"},
          {text: "PATCH", value: "PATCH"},
        ],
      },
      {
        title: "请求URI",
        dataIndex: "requestUri",
        key: "requestUri",
        width: "200px",
        sorter: true,
        ...this.getColumnSearchProps("requestUri"),
      },
      {
        title: "语言",
        dataIndex: "language",
        key: "language",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("language"),
      },
      {
        title: "地区",
        dataIndex: "region",
        key: "region",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("region"),
      },
      {
        title: "城市",
        dataIndex: "city",
        key: "city",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("city"),
      },
      {
        title: "单元",
        dataIndex: "unit",
        key: "unit",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("unit"),
      },
      {
        title: "节",
        dataIndex: "section",
        key: "section",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("section"),
      },
      {
        title: "次数",
        dataIndex: "count",
        key: "count",
        width: "90px",
        sorter: true,
        render: (text) => text === 0 || !text ? 1 : text,
      },
      {
        title: "响应",
        dataIndex: "response",
        key: "response",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("response"),
      },
      {
        title: "对象",
        dataIndex: "object",
        key: "object",
        width: "160px",
        sorter: true,
        ...this.getColumnSearchProps("object"),
        render: (text) => (
          <div style={{maxWidth: "160px"}}>
            <Typography.Text ellipsis={{tooltip: text}}>{text}</Typography.Text>
          </div>
        ),
      },
      {
        title: "错误信息",
        dataIndex: "errorText",
        key: "errorText",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("errorText"),
        render: (text) => (
          text ? <Alert description={text} type="error" showIcon style={{padding: "4px"}} icon={<CloseCircleFilled style={{fontSize: "16px", margin: "4px 8px 0 4px"}} />} /> : null
        ),
      },
      {
        title: "动作",
        dataIndex: "action",
        key: "action",
        width: "120px",
        sorter: true,
        ...this.getColumnSearchProps("action"),
        fixed: Setting.isMobile() ? "false" : "right",
      },
      {
        title: "操作",
        dataIndex: "recordAction",
        key: "recordAction",
        width: "100px",
        fixed: Setting.isMobile() ? "false" : "right",
        render: (text, record, index) => (
          <div>
            <Popconfirm
              title={`确认删除: ${record.name} ?`}
              onConfirm={() => this.deleteRecord(index)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary" danger size="small">删除</Button>
            </Popconfirm>
          </div>
        ),
      },
    ];

    const paginationProps = {
      pageSize: this.state.pagination.pageSize,
      total: this.state.pagination.total,
      showQuickJumper: true,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100", "1000"],
      showTotal: () => `共 ${this.state.pagination.total} 条`,
    };

    return (
      <div>
        <Helmet><title>{Setting.getPageTitle("操作日志")}</title></Helmet>
        <Table
          scroll={{x: "max-content"}}
          columns={columns}
          dataSource={records}
          rowKey={(record) => `${record.owner}/${record.name}`}
          rowSelection={this.getRowSelection()}
          size="middle"
          bordered
          pagination={paginationProps}
          title={() => (
            <div>
              审计日志
              {this.state.selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`确认删除 ${this.state.selectedRowKeys.length} 条记录?`}
                  onConfirm={() => this.performBulkDelete(this.state.selectedRows, this.state.selectedRowKeys)}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button type="primary" danger size="small" icon={<DeleteOutlined />} style={{marginLeft: 8}}>
                    删除 ({this.state.selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
            </div>
          )}
          loading={this.getTableLoading()}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }

  fetch = (params = {}) => {
    const field = params.searchedColumn, value = params.searchText;
    const sortField = params.sortField, sortOrder = params.sortOrder;
    this.setState({loading: true});
    RecordBackend.getRecords(Setting.getRequestOrganization(this.props.account), params.pagination.current, params.pagination.pageSize, field, value, sortField, sortOrder)
      .then((res) => {
        this.setState({loading: false});
        if (res.status === "ok") {
          this.setState({
            data: res.data,
            pagination: {
              ...params.pagination,
              total: res.data2,
            },
            searchText: params.searchText,
            searchedColumn: params.searchedColumn,
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

export default RecordListPage;
