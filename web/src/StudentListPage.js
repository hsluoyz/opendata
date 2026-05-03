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
import * as StudentBackend from "./backend/StudentBackend";
import * as Setting from "./Setting";

class StudentListPage extends BaseListPage {
  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    window.addEventListener("schoolChanged", this.onSchoolChanged);
    window.addEventListener("gradeChanged", this.onGradeChanged);
    window.addEventListener("classChanged", this.onClassChanged);
  }

  componentWillUnmount() {
    window.removeEventListener("schoolChanged", this.onSchoolChanged);
    window.removeEventListener("gradeChanged", this.onGradeChanged);
    window.removeEventListener("classChanged", this.onClassChanged);
  }

  onSchoolChanged = () => {
    this.fetch({pagination: {current: 1, pageSize: this.state.pagination.pageSize}});
  };

  onGradeChanged = () => {
    this.fetch({pagination: {current: 1, pageSize: this.state.pagination.pageSize}});
  };

  onClassChanged = () => {
    this.fetch({pagination: {current: 1, pageSize: this.state.pagination.pageSize}});
  };

  newStudent() {
    const school = Setting.getSchool(this.props.account);
    return {
      owner: school || "admin",
      name: `student-${Setting.getRandomName()}`,
      displayName: "新学生",
      school: school || "",
      grade: Setting.getGrade() || "",
      class: Setting.getClass() || "",
      studentId: "",
      gender: "男",
      birthDate: "",
      address: "",
      phone: "",
      parents: [],
      admins: [],
      viewers: [],
    };
  }

  addStudent() {
    const student = this.newStudent();
    StudentBackend.addStudent(student).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "添加成功");
        this.props.history.push(`/students/${student.owner}/${student.name}`);
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  deleteStudent(record) {
    StudentBackend.deleteStudent(record).then(res => {
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
    StudentBackend.getStudents(
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
        const gradeFilter = Setting.getGrade();
        const classFilter = Setting.getClass();
        if (gradeFilter) data = data.filter(s => s.grade === gradeFilter);
        if (classFilter) data = data.filter(s => s.class === classFilter);
        this.setState({
          data,
          pagination: {...pagination, total: res.data2},
        });
      }
    });
  };

  renderTable(students) {
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        sorter: true,
        ...this.getColumnSearchProps("name"),
        render: (text, record) => (
          <Link to={`/students/${record.owner}/${record.name}`}>{text}</Link>
        ),
      },
      {
        title: "显示名",
        dataIndex: "displayName",
        ...this.getColumnSearchProps("displayName"),
      },
      {
        title: "学号",
        dataIndex: "studentId",
        ...this.getColumnSearchProps("studentId"),
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
        title: "性别",
        dataIndex: "gender",
        width: 70,
      },
      {
        title: "电话",
        dataIndex: "phone",
      },
      {
        title: "操作",
        width: 120,
        render: (text, record) => (
          <Popconfirm
            title="确认删除该学生?"
            onConfirm={() => this.deleteStudent(record)}
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
          <Button type="primary" onClick={() => this.addStudent()}>
            添加学生
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={students?.map(s => ({...s, key: s.name}))}
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

export default StudentListPage;
