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
import {Button, Popconfirm, Table, Tag} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import BaseListPage from "./BaseListPage";
import * as Setting from "./Setting";
import * as SessionBackend from "./backend/SessionBackend";

class SessionListPage extends BaseListPage {
  deleteItem = async(i) => {
    return SessionBackend.deleteSession(this.state.data[i]);
  };

  deleteSession(i) {
    SessionBackend.deleteSession(this.state.data[i])
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
        Setting.showMessage("error", `连接服务器失败: ${error}`);
      });
  }

  renderTable(sessions) {
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        width: "150px",
        fixed: "left",
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...this.getColumnSearchProps("name"),
      },
      {
        title: "组织",
        dataIndex: "owner",
        key: "owner",
        width: "110px",
        sorter: (a, b) => a.owner.localeCompare(b.owner),
        ...this.getColumnSearchProps("owner"),
      },
      {
        title: "创建时间",
        dataIndex: "createdTime",
        key: "createdTime",
        width: "180px",
        sorter: (a, b) => a.createdTime.localeCompare(b.createdTime),
        render: (text) => Setting.getFormattedDate(text),
      },
      {
        title: "Session ID",
        dataIndex: "sessionId",
        key: "sessionId",
        width: "300px",
        render: (text) => (text || []).map((item, index) => (
          <Tag key={index}>{item}</Tag>
        )),
      },
      {
        title: "操作",
        dataIndex: "action",
        key: "action",
        width: "100px",
        fixed: Setting.isMobile() ? "false" : "right",
        render: (text, session, index) => (
          <div>
            <Popconfirm
              title={`确认删除: ${session.name} ?`}
              onConfirm={() => this.deleteSession(index)}
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
        <Table
          scroll={{x: "max-content"}}
          columns={columns}
          dataSource={sessions}
          rowKey={(session) => `${session.owner}/${session.name}`}
          rowSelection={this.getRowSelection()}
          size="middle"
          bordered
          pagination={paginationProps}
          title={() => (
            <div>
              会话列表
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
    SessionBackend.getSessions(Setting.getRequestOrganization(this.props.account), params.pagination.current, params.pagination.pageSize, field, value, sortField, sortOrder)
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

export default SessionListPage;
