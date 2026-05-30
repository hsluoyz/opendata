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
import {Link} from "react-router-dom";
import {Button, Popconfirm, Table} from "antd";
import BaseListPage from "./BaseListPage";
import * as TeacherBackend from "./backend/TeacherBackend";
import * as Setting from "./Setting";

class TeacherListPage extends BaseListPage {
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

  newTeacher() {
    const school = Setting.getSchool(this.props.account);
    return {
      owner: school || "admin",
      name: `teacher-${Setting.getRandomName()}`,
      displayName: "新教师",
      school: school || "",
      title: "",
      phone: "",
      email: "",
      gender: "男",
      subjects: [],
      admins: [],
      viewers: [],
    };
  }

  addTeacher() {
    const teacher = this.newTeacher();
    TeacherBackend.addTeacher(teacher).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "添加成功");
        this.props.history.push(`/teachers/${teacher.owner}/${teacher.name}`);
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  deleteTeacher(record) {
    TeacherBackend.deleteTeacher(record).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "删除成功");
        this.setState({data: this.state.data.filter(t => t.name !== record.name)});
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  fetch = (params = {}) => {
    const {pagination, sortField, sortOrder, searchText, searchedColumn} = params;
    const school = Setting.getSchool(this.props.account);
    this.setState({loading: true});
    TeacherBackend.getTeachers(
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

  renderTable(teachers) {
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        sorter: true,
        ...this.getColumnSearchProps("name"),
        render: (text, record) => (
          <Link to={`/teachers/${record.owner}/${record.name}`}>{text}</Link>
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
        title: "职称",
        dataIndex: "title",
      },
      {
        title: "性别",
        dataIndex: "gender",
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
        title: "操作",
        width: 180,
        fixed: "right",
        render: (text, record) => (
          <div>
            <Button
              style={{marginTop: 10, marginBottom: 10, marginRight: 10}}
              type="primary"
              onClick={() => this.props.history.push(`/teachers/${record.owner}/${record.name}`)}
            >
              编辑
            </Button>
            <Popconfirm
              title={`确认删除: ${record.name} ?`}
              onConfirm={() => this.deleteTeacher(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button style={{marginBottom: 10}} type="primary" danger>删除</Button>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return (
      <div>
        <Helmet><title>{Setting.getPageTitle("教师列表")}</title></Helmet>
        <Table
          scroll={{x: "max-content"}}
          columns={columns}
          dataSource={teachers?.map(t => ({...t, key: t.name}))}
          pagination={this.state.pagination}
          onChange={this.handleTableChange}
          loading={this.getTableLoading()}
          bordered
          size="middle"
          title={() => (
            <div>
              教师列表&nbsp;&nbsp;&nbsp;&nbsp;
              <Button type="primary" size="small" onClick={() => this.addTeacher()}>添加</Button>
            </div>
          )}
        />
      </div>
    );
  }
}

export default TeacherListPage;
