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
import * as ClassBackend from "./backend/ClassBackend";
import * as Setting from "./Setting";

class ClassListPage extends BaseListPage {
  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    window.addEventListener("schoolChanged", this.onSchoolChanged);
    window.addEventListener("gradeChanged", this.onGradeChanged);
  }

  componentWillUnmount() {
    window.removeEventListener("schoolChanged", this.onSchoolChanged);
    window.removeEventListener("gradeChanged", this.onGradeChanged);
  }

  onSchoolChanged = () => {
    this.fetch({pagination: {current: 1, pageSize: this.state.pagination.pageSize}});
  };

  onGradeChanged = () => {
    this.fetch({pagination: {current: 1, pageSize: this.state.pagination.pageSize}});
  };

  newClass() {
    const school = Setting.getSchool(this.props.account);
    const grade = Setting.getGrade();
    return {
      owner: school || "admin",
      name: `class-${Setting.getRandomName()}`,
      displayName: "新班级",
      school: school || "",
      grade: grade || "",
      admins: [],
      viewers: [],
    };
  }

  addClass() {
    const cls = this.newClass();
    ClassBackend.addClass(cls).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "添加成功");
        this.props.history.push(`/classes/${cls.owner}/${cls.name}`);
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  deleteClass(record) {
    ClassBackend.deleteClass(record).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "删除成功");
        this.setState({data: this.state.data.filter(c => c.name !== record.name)});
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  fetch = (params = {}) => {
    const {pagination, sortField, sortOrder, searchText, searchedColumn} = params;
    const school = Setting.getSchool(this.props.account);
    this.setState({loading: true});
    ClassBackend.getClasses(
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
        let data = res.data || [];
        // Filter by grade from query params or localStorage
        const gradeFilter = new URLSearchParams(this.props.location?.search).get("grade") || Setting.getGrade();
        if (gradeFilter) {
          data = data.filter(c => c.grade === gradeFilter);
        }
        this.setState({
          data,
          pagination: {...pagination, total: res.data2},
        });
      }
    });
  };

  renderTable(classes) {
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        sorter: true,
        ...this.getColumnSearchProps("name"),
        render: (text, record) => (
          <Link to={`/classes/${record.owner}/${record.name}`}>{text}</Link>
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
        title: "年级",
        dataIndex: "grade",
      },
      {
        title: "操作",
        width: 120,
        render: (text, record) => (
          <Popconfirm
            title="确认删除该班级?"
            onConfirm={() => this.deleteClass(record)}
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
          <Button type="primary" onClick={() => this.addClass()}>
            添加班级
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={classes?.map(c => ({...c, key: c.name}))}
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

export default ClassListPage;
