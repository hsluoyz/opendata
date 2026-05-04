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
import * as SubjectBackend from "./backend/SubjectBackend";
import * as Setting from "./Setting";

class SubjectListPage extends BaseListPage {
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

  newSubject() {
    const school = Setting.getSchool(this.props.account);
    return {
      owner: school || "admin",
      name: `subject-${Setting.getRandomName()}`,
      displayName: "新学科",
      school: school || "",
      grade: "",
      class: "",
      teacher: "",
      admins: [],
      viewers: [],
    };
  }

  addSubject() {
    const subject = this.newSubject();
    SubjectBackend.addSubject(subject).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "添加成功");
        this.props.history.push(`/subjects/${subject.owner}/${subject.name}`);
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  deleteSubject(record) {
    SubjectBackend.deleteSubject(record).then(res => {
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
    const school = Setting.getSchool(this.props.account);
    this.setState({loading: true});
    SubjectBackend.getSubjects(
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

  renderTable(subjects) {
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        sorter: true,
        ...this.getColumnSearchProps("name"),
        render: (text, record) => (
          <Link to={`/subjects/${record.owner}/${record.name}`}>{text}</Link>
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
        title: "班级",
        dataIndex: "class",
      },
      {
        title: "教师",
        dataIndex: "teacher",
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
              onClick={() => this.props.history.push(`/subjects/${record.owner}/${record.name}`)}
            >
              编辑
            </Button>
            <Popconfirm
              title={`确认删除: ${record.name} ?`}
              onConfirm={() => this.deleteSubject(record)}
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
        <Table
          scroll={{x: "max-content"}}
          columns={columns}
          dataSource={subjects?.map(s => ({...s, key: s.name}))}
          pagination={this.state.pagination}
          onChange={this.handleTableChange}
          loading={this.getTableLoading()}
          bordered
          size="middle"
          title={() => (
            <div>
              学科列表&nbsp;&nbsp;&nbsp;&nbsp;
              <Button type="primary" size="small" onClick={() => this.addSubject()}>添加</Button>
            </div>
          )}
        />
      </div>
    );
  }
}

export default SubjectListPage;
