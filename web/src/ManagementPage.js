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
import {Link, Route, Switch, withRouter} from "react-router-dom";
import {Avatar, Dropdown, Layout, Menu, Select, Space, Typography} from "antd";
import {
  ApartmentOutlined,
  BankOutlined,
  BookOutlined,
  CloudOutlined,
  FileOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import * as AccountBackend from "./backend/AccountBackend";
import * as SchoolBackend from "./backend/SchoolBackend";
import * as GradeBackend from "./backend/GradeBackend";
import * as ClassBackend from "./backend/ClassBackend";
import * as Setting from "./Setting";
import HomePage from "./HomePage";
import SchoolListPage from "./SchoolListPage";
import SchoolEditPage from "./SchoolEditPage";
import GradeListPage from "./GradeListPage";
import GradeEditPage from "./GradeEditPage";
import ClassListPage from "./ClassListPage";
import ClassEditPage from "./ClassEditPage";
import SubjectListPage from "./SubjectListPage";
import SubjectEditPage from "./SubjectEditPage";
import TeacherListPage from "./TeacherListPage";
import TeacherEditPage from "./TeacherEditPage";
import StudentListPage from "./StudentListPage";
import StudentEditPage from "./StudentEditPage";
import ParentListPage from "./ParentListPage";
import ParentEditPage from "./ParentEditPage";
import FileListPage from "./FileListPage";
import FileEditPage from "./FileEditPage";
import ProviderListPage from "./ProviderListPage";
import ProviderEditPage from "./ProviderEditPage";

const {Header, Sider, Content} = Layout;
const {Text} = Typography;

class ManagementPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      schools: [],
      grades: [],
      classes: [],
      selectedSchool: localStorage.getItem("selectedSchool") || "",
      selectedGrade: localStorage.getItem("selectedGrade") || "",
      selectedClass: localStorage.getItem("selectedClass") || "",
      collapsed: false,
    };
  }

  UNSAFE_componentWillMount() {
    this.getSchools();
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
    const selectedSchool = localStorage.getItem("selectedSchool") || "";
    this.setState({selectedSchool, selectedGrade: "", selectedClass: "", grades: [], classes: []});
    if (selectedSchool) {
      this.getGrades(selectedSchool);
    }
  };

  onGradeChanged = () => {
    const selectedGrade = localStorage.getItem("selectedGrade") || "";
    this.setState({selectedGrade, selectedClass: "", classes: []});
    const {selectedSchool} = this.state;
    if (selectedSchool && selectedGrade) {
      this.getClasses(selectedSchool);
    }
  };

  onClassChanged = () => {
    const selectedClass = localStorage.getItem("selectedClass") || "";
    this.setState({selectedClass});
  };

  getSchools() {
    SchoolBackend.getSchools("admin", 1, 1000, "", "", "", "").then(res => {
      if (res.status === "ok") {
        const schools = res.data || [];
        this.setState({schools});
        const {selectedSchool} = this.state;
        if (selectedSchool) {
          this.getGrades(selectedSchool);
        }
      }
    });
  }

  getGrades(schoolName) {
    GradeBackend.getGrades(schoolName, 1, 1000, "", "", "", "").then(res => {
      if (res.status === "ok") {
        this.setState({grades: res.data || []});
        const {selectedGrade} = this.state;
        if (selectedGrade) {
          this.getClasses(schoolName);
        }
      }
    });
  }

  getClasses(schoolName) {
    ClassBackend.getClasses(schoolName, 1, 1000, "", "", "", "").then(res => {
      if (res.status === "ok") {
        this.setState({classes: res.data || []});
      }
    });
  }

  handleSchoolChange(value) {
    Setting.setSchool(value || "");
  }

  handleGradeChange(value) {
    Setting.setGrade(value || "");
  }

  handleClassChange(value) {
    Setting.setClass(value || "");
  }

  handleSignout() {
    AccountBackend.signout().then(() => {
      Setting.showMessage("success", "已退出登录");
      if (this.props.onSignout) {
        this.props.onSignout();
      }
      this.props.history.push("/signin");
    });
  }

  getSelectedMenuKey() {
    const path = this.props.location.pathname;
    if (path.startsWith("/schools")) return "/schools";
    if (path.startsWith("/grades")) return "/grades";
    if (path.startsWith("/classes")) return "/classes";
    if (path.startsWith("/subjects")) return "/subjects";
    if (path.startsWith("/teachers")) return "/teachers";
    if (path.startsWith("/students")) return "/students";
    if (path.startsWith("/parents")) return "/parents";
    if (path.startsWith("/files")) return "/files";
    if (path.startsWith("/providers")) return "/providers";
    return "/";
  }

  render() {
    const {account} = this.props;
    const {schools, grades, classes, selectedSchool, selectedGrade, selectedClass, collapsed} = this.state;
    const isAdmin = Setting.isAdminUser(account);

    const menuItems = [
      {key: "/", icon: <HomeOutlined />, label: <Link to="/">首页</Link>},
      {key: "/schools", icon: <BankOutlined />, label: <Link to="/schools">学校</Link>},
      {key: "/grades", icon: <ApartmentOutlined />, label: <Link to="/grades">年级</Link>},
      {key: "/classes", icon: <TeamOutlined />, label: <Link to="/classes">班级</Link>},
      {key: "/subjects", icon: <BookOutlined />, label: <Link to="/subjects">学科</Link>},
      {key: "/teachers", icon: <UserOutlined />, label: <Link to="/teachers">教师</Link>},
      {key: "/students", icon: <SolutionOutlined />, label: <Link to="/students">学生</Link>},
      {key: "/parents", icon: <HeartOutlined />, label: <Link to="/parents">家长</Link>},
      {key: "/files", icon: <FileOutlined />, label: <Link to="/files">文件</Link>},
    ];

    if (isAdmin) {
      menuItems.push({
        key: "/providers",
        icon: <CloudOutlined />,
        label: <Link to="/providers">存储配置</Link>,
      });
    }

    const userMenuItems = [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "退出登录",
        onClick: () => this.handleSignout(),
      },
    ];

    const filteredGrades = selectedSchool
      ? grades.filter(g => g.school === selectedSchool || !g.school)
      : grades;

    const filteredClasses = selectedGrade
      ? classes.filter(c => c.grade === selectedGrade || !c.grade)
      : classes;

    return (
      <Layout style={{minHeight: "100vh"}}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={v => this.setState({collapsed: v})}
          style={{background: "#fff", boxShadow: "2px 0 8px rgba(0,0,0,0.08)"}}
          width={200}
        >
          <div style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
            overflow: "hidden",
          }}>
            {collapsed ? (
              <span style={{fontWeight: 700, color: "#1677ff", fontSize: 18}}>OD</span>
            ) : (
              <span style={{fontWeight: 700, color: "#1677ff", fontSize: 16}}>OpenData</span>
            )}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[this.getSelectedMenuKey()]}
            items={menuItems}
            style={{borderRight: 0, marginTop: 8}}
          />
        </Sider>
        <Layout>
          <Header style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            zIndex: 1,
          }}>
            <Text strong style={{fontSize: 18, color: "#1677ff"}}>OpenData 数据管理系统</Text>
            <Space size="middle" wrap>
              <Select
                placeholder="选择学校"
                value={selectedSchool || undefined}
                onChange={v => this.handleSchoolChange(v)}
                allowClear
                style={{width: 160}}
                options={schools.map(s => ({value: s.name, label: s.displayName || s.name}))}
              />
              <Select
                placeholder="选择年级"
                value={selectedGrade || undefined}
                onChange={v => this.handleGradeChange(v)}
                allowClear
                style={{width: 130}}
                disabled={!selectedSchool}
                options={filteredGrades.map(g => ({value: g.name, label: g.displayName || g.name}))}
              />
              <Select
                placeholder="选择班级"
                value={selectedClass || undefined}
                onChange={v => this.handleClassChange(v)}
                allowClear
                style={{width: 130}}
                disabled={!selectedGrade}
                options={filteredClasses.map(c => ({value: c.name, label: c.displayName || c.name}))}
              />
              <Dropdown menu={{items: userMenuItems}} placement="bottomRight">
                <Space style={{cursor: "pointer"}}>
                  <Avatar icon={<UserOutlined />} style={{backgroundColor: "#1677ff"}} />
                  <Text>{account?.displayName || account?.name || "用户"}</Text>
                </Space>
              </Dropdown>
            </Space>
          </Header>
          <Content style={{margin: 0, background: "#f5f7fa", minHeight: "calc(100vh - 64px)"}}>
            <Switch>
              <Route exact path="/" render={props => <HomePage {...props} account={account} />} />
              <Route exact path="/schools" render={props => <SchoolListPage {...props} account={account} />} />
              <Route path="/schools/:owner/:name" render={props => <SchoolEditPage {...props} account={account} />} />
              <Route exact path="/grades" render={props => <GradeListPage {...props} account={account} />} />
              <Route path="/grades/:owner/:name" render={props => <GradeEditPage {...props} account={account} />} />
              <Route exact path="/classes" render={props => <ClassListPage {...props} account={account} />} />
              <Route path="/classes/:owner/:name" render={props => <ClassEditPage {...props} account={account} />} />
              <Route exact path="/subjects" render={props => <SubjectListPage {...props} account={account} />} />
              <Route path="/subjects/:owner/:name" render={props => <SubjectEditPage {...props} account={account} />} />
              <Route exact path="/teachers" render={props => <TeacherListPage {...props} account={account} />} />
              <Route path="/teachers/:owner/:name" render={props => <TeacherEditPage {...props} account={account} />} />
              <Route exact path="/students" render={props => <StudentListPage {...props} account={account} />} />
              <Route path="/students/:owner/:name" render={props => <StudentEditPage {...props} account={account} />} />
              <Route exact path="/parents" render={props => <ParentListPage {...props} account={account} />} />
              <Route path="/parents/:owner/:name" render={props => <ParentEditPage {...props} account={account} />} />
              <Route exact path="/files" render={props => <FileListPage {...props} account={account} />} />
              <Route path="/files/:owner/:name" render={props => <FileEditPage {...props} account={account} />} />
              <Route exact path="/providers" render={props => <ProviderListPage {...props} account={account} />} />
              <Route path="/providers/:owner/:name" render={props => <ProviderEditPage {...props} account={account} />} />
            </Switch>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default withRouter(ManagementPage);
