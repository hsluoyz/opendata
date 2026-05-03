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
import * as SchoolBackend from "./backend/SchoolBackend";
import * as Setting from "./Setting";

class SchoolListPage extends BaseListPage {
  newSchool() {
    return {
      owner: "admin",
      name: `school-${Setting.getRandomName()}`,
      displayName: "新学校",
      description: "",
      address: "",
      phone: "",
      logo: "",
      admins: [],
      viewers: [],
    };
  }

  addSchool() {
    const school = this.newSchool();
    SchoolBackend.addSchool(school).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "添加成功");
        this.props.history.push(`/schools/admin/${school.name}`);
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  deleteSchool(record) {
    SchoolBackend.deleteSchool(record).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "删除成功");
        this.setState({data: this.state.data.filter(s => s.name !== record.name)});
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  fetch = (params = {}) => {
    const {pagination, sortField, sortOrder, searchText, searchedColumn} = params;
    this.setState({loading: true});
    SchoolBackend.getSchools(
      "admin",
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

  renderTable(schools) {
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        sorter: true,
        ...this.getColumnSearchProps("name"),
        render: (text, record) => (
          <Link to={`/schools/${record.owner}/${record.name}`}>{text}</Link>
        ),
      },
      {
        title: "显示名",
        dataIndex: "displayName",
        ...this.getColumnSearchProps("displayName"),
      },
      {
        title: "地址",
        dataIndex: "address",
        ...this.getColumnSearchProps("address"),
      },
      {
        title: "电话",
        dataIndex: "phone",
      },
      {
        title: "简介",
        dataIndex: "description",
        ellipsis: true,
      },
      {
        title: "操作",
        width: 120,
        render: (text, record) => (
          <Popconfirm
            title="确认删除该学校?"
            onConfirm={() => this.deleteSchool(record)}
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
          <Button type="primary" onClick={() => this.addSchool()}>
            添加学校
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={schools?.map(s => ({...s, key: s.name}))}
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

export default SchoolListPage;
