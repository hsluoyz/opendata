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
import BaseListPage from "./BaseListPage";
import * as ParentBackend from "./backend/ParentBackend";
import * as Setting from "./Setting";

class ParentListPage extends BaseListPage {
  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    window.addEventListener("schoolChanged", this.onSchoolChanged);
  }

  componentWillUnmount() {
    window.removeEventListener("schoolChanged", this.onSchoolChanged);
  }

  onSchoolChanged = () => {
    this.fetch({pagination: {current: 1, pageSize: this.state.pagination.pageSize}});
  };

  newParent() {
    const school = Setting.getSchool(this.props.account);
    return {
      owner: school || "admin",
      name: `parent-${Setting.getRandomName()}`,
      displayName: "新家长",
      school: school || "",
      phone: "",
      email: "",
      gender: "男",
      relation: "父亲",
      student: "",
      admins: [],
      viewers: [],
    };
  }

  addParent() {
    const parent = this.newParent();
    ParentBackend.addParent(parent).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "添加成功");
        this.props.history.push(`/parents/${parent.owner}/${parent.name}`);
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  deleteParent(record) {
    ParentBackend.deleteParent(record).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "删除成功");
        this.setState({data: this.state.data.filter(p => p.name !== record.name)});
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  fetch = (params = {}) => {
    const {pagination, sortField, sortOrder, searchText, searchedColumn} = params;
    const school = Setting.getSchool(this.props.account);
    this.setState({loading: true});
    ParentBackend.getParents(
      school || "admin",
      pagination?.current,
      pagination?.pageSize,
      searchedColumn,
      searchText,
      sortField,
      sortOrder
    ).then(res => {
      this.setState({loading: false});
      if (res.status === "ok") {
        this.setState({
          data: res.data,
          pagination: {...pagination, total: res.data2},
        });
      }
    });
  };

  renderTable(parents) {
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        sorter: true,
        ...this.getColumnSearchProps("name"),
        render: (text, record) => (
          <Link to={`/parents/${record.owner}/${record.name}`}>{text}</Link>
        ),
      },
      {
        title: "显示名",
        dataIndex: "displayName",
        ...this.getColumnSearchProps("displayName"),
      },
      {
        title: "学校",
        dataIndex: "school",
      },
      {
        title: "关系",
        dataIndex: "relation",
      },
      {
        title: "性别",
        dataIndex: "gender",
        width: 70,
      },
      {
        title: "电话",
        dataIndex: "phone",
      },
      {
        title: "邮箱",
        dataIndex: "email",
      },
      {
        title: "关联学生",
        dataIndex: "student",
      },
      {
        title: "操作",
        width: 120,
        render: (text, record) => (
          <Popconfirm
            title="确认删除该家长?"
            onConfirm={() => this.deleteParent(record)}
            okText="确认"
            cancelText="取消"
          >
            <Button danger size="small">删除</Button>
          </Popconfirm>
        ),
      },
    ];

    return (
      <div>
        <div style={{marginBottom: 16}}>
          <Button type="primary" onClick={() => this.addParent()}>
            添加家长
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={parents?.map(p => ({...p, key: p.name}))}
          pagination={this.state.pagination}
          onChange={this.handleTableChange}
          loading={this.state.loading}
          bordered
          size="middle"
        />
      </div>
    );
  }
}

export default ParentListPage;
