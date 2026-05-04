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
import {Avatar, Button, Card, Dropdown, Layout, Menu, Result, Select, Space} from "antd";
import {
  ApartmentOutlined,
  BankOutlined,
  BookOutlined,
  CloudOutlined,
  DatabaseOutlined,
  DownOutlined,
  FileOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined
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

const {Header, Content, Sider} = Layout;

function getMenuParentKey(uri) {
  if (!uri) {
    return null;
  }
  if (uri.includes("/schools") || uri.includes("/grades") || uri.includes("/classes") || uri.includes("/subjects")) {
    return "/education";
  }
  if (uri.includes("/teachers") || uri.includes("/students") || uri.includes("/parents")) {
    return "/people";
  }
  if (uri.includes("/files") || uri.includes("/providers")) {
    return "/storage";
  }
  return null;
}

class ManagementPage extends React.Component {
  constructor(props) {
    super(props);
    const siderCollapsed = localStorage.getItem("siderCollapsed") === "true";
    const parentKey = getMenuParentKey(props.location.pathname);
    this.state = {
      schools: [],
      grades: [],
      classes: [],
      selectedSchool: localStorage.getItem("selectedSchool") || "",
      selectedGrade: localStorage.getItem("selectedGrade") || "",
      selectedClass: localStorage.getItem("selectedClass") || "",
      siderCollapsed,
      menuOpenKeys: siderCollapsed ? [] : ["/education", "/people", "/storage"].filter(key => key === parentKey || key !== null),
    };
  }

  UNSAFE_componentWillMount() {
    this.getSchools();
    window.addEventListener("schoolChanged", this.onSchoolChanged);
    window.addEventListener("gradeChanged", this.onGradeChanged);
    window.addEventListener("classChanged", this.onClassChanged);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname && !this.state.siderCollapsed) {
      const parentKey = getMenuParentKey(this.props.location.pathname);
      if (parentKey && !this.state.menuOpenKeys.includes(parentKey)) {
        this.setState({menuOpenKeys: [...this.state.menuOpenKeys, parentKey]});
      }
    }
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
    if (this.state.selectedSchool && selectedGrade) {
      this.getClasses(this.state.selectedSchool);
    }
  };

  onClassChanged = () => {
    this.setState({selectedClass: localStorage.getItem("selectedClass") || ""});
  };

  getSchools() {
    SchoolBackend.getSchools("admin", 1, 1000, "", "", "", "").then(res => {
      if (res.status === "ok") {
        this.setState({schools: res.data || []});
        if (this.state.selectedSchool) {
          this.getGrades(this.state.selectedSchool);
        }
      }
    });
  }

  getGrades(schoolName) {
    GradeBackend.getGrades(schoolName, 1, 1000, "", "", "", "").then(res => {
      if (res.status === "ok") {
        this.setState({grades: res.data || []});
        if (this.state.selectedGrade) {
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

  getSelectedMenuKey() {
    const path = this.props.location.pathname;
    const firstSeg = path.split("/").filter(Boolean)[0] || "";
    return firstSeg === "" ? "/" : `/${firstSeg}`;
  }

  handleSignout() {
    AccountBackend.signout().then(() => {
      Setting.showMessage("success", "Signed out");
      this.props.onSignout?.();
      this.props.history.push("/signin");
    });
  }

  toggleSider = () => {
    const siderCollapsed = !this.state.siderCollapsed;
    localStorage.setItem("siderCollapsed", String(siderCollapsed));
    this.setState({
      siderCollapsed,
      menuOpenKeys: siderCollapsed ? [] : ["/education", "/people", "/storage"],
    });
  };

  getMenuItems() {
    const items = [
      Setting.getItem(<Link to="/">Home</Link>, "/", <HomeOutlined />),
      Setting.getItem("Education", "/education", <DatabaseOutlined />, [
        Setting.getItem(<Link to="/schools">Schools</Link>, "/schools", <BankOutlined />),
        Setting.getItem(<Link to="/grades">Grades</Link>, "/grades", <ApartmentOutlined />),
        Setting.getItem(<Link to="/classes">Classes</Link>, "/classes", <TeamOutlined />),
        Setting.getItem(<Link to="/subjects">Subjects</Link>, "/subjects", <BookOutlined />),
      ]),
      Setting.getItem("People", "/people", <UserOutlined />, [
        Setting.getItem(<Link to="/teachers">Teachers</Link>, "/teachers", <UserOutlined />),
        Setting.getItem(<Link to="/students">Students</Link>, "/students", <SolutionOutlined />),
        Setting.getItem(<Link to="/parents">Parents</Link>, "/parents", <HeartOutlined />),
      ]),
      Setting.getItem("Storage", "/storage", <CloudOutlined />, [
        Setting.getItem(<Link to="/files">Files</Link>, "/files", <FileOutlined />),
      ]),
    ];

    if (Setting.isAdminUser(this.props.account)) {
      items[3].children.push(Setting.getItem(<Link to="/providers">Storage Providers</Link>, "/providers", <CloudOutlined />));
    }
    return items;
  }

  renderAccountMenu() {
    const {account} = this.props;
    const items = [{
      key: "/logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      onClick: () => this.handleSignout(),
    }];
    return (
      <Dropdown menu={{items}}>
        <div className="rightDropDown">
          <Avatar style={{backgroundColor: Setting.getAvatarColor(account?.name)}} size={32}>
            {Setting.getShortName(account?.displayName || account?.name)}
          </Avatar>
          {!Setting.isMobile() && (
            <span style={{fontSize: 14, fontWeight: 500, marginLeft: 8, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
              {account?.displayName || account?.name}
            </span>
          )}
          <DownOutlined style={{fontSize: 10, opacity: 0.45, marginLeft: 6}} />
        </div>
      </Dropdown>
    );
  }

  renderHeader() {
    const {schools, grades, classes, selectedSchool, selectedGrade, selectedClass} = this.state;
    const filteredClasses = selectedGrade ? classes.filter(c => c.grade === selectedGrade || !c.grade) : classes;

    return (
      <Header style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px 0 0", backgroundColor: "#ffffff", position: "sticky", top: 0, zIndex: 99, borderBottom: "1px solid #f0f0f0", height: 52, lineHeight: "52px"}}>
        <div style={{display: "flex", alignItems: "center"}}>
          <Button
            icon={this.state.siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={this.toggleSider}
            type="text"
            style={{fontSize: 16, width: 40, height: 40}}
          />
          <span style={{fontWeight: 600}}>OpenData</span>
        </div>
        <Space size={8}>
          <Select placeholder="School" value={selectedSchool || undefined} onChange={value => Setting.setSchool(value || "")} allowClear style={{width: 160}} options={schools.map(s => ({value: s.name, label: s.displayName || s.name}))} />
          <Select placeholder="Grade" value={selectedGrade || undefined} onChange={value => Setting.setGrade(value || "")} allowClear style={{width: 130}} disabled={!selectedSchool} options={grades.map(g => ({value: g.name, label: g.displayName || g.name}))} />
          <Select placeholder="Class" value={selectedClass || undefined} onChange={value => Setting.setClass(value || "")} allowClear style={{width: 130}} disabled={!selectedGrade} options={filteredClasses.map(c => ({value: c.name, label: c.displayName || c.name}))} />
          {this.renderAccountMenu()}
        </Space>
      </Header>
    );
  }

  renderRouter() {
    const {account} = this.props;
    return (
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
        <Route exact path="/providers/:providerName" render={props => <ProviderEditPage {...props} account={account} />} />
        <Route path="" render={() => <Result status="404" title="404 NOT FOUND" extra={<a href="/"><Button type="primary">Back Home</Button></a>} />} />
      </Switch>
    );
  }

  render() {
    const siderWidth = 256;
    const siderCollapsedWidth = 80;
    const contentMarginLeft = this.state.siderCollapsed ? siderCollapsedWidth : siderWidth;

    return (
      <>
        <Sider
          collapsed={this.state.siderCollapsed}
          collapsedWidth={siderCollapsedWidth}
          width={siderWidth}
          trigger={null}
          theme="light"
          style={{
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            borderRight: "1px solid #eaedf3",
            background: "#fafbfc",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: this.state.siderCollapsed ? "center" : "flex-start", padding: this.state.siderCollapsed ? 0 : "0 16px 0 24px", overflow: "hidden", borderBottom: "1px solid #eaedf3"}}>
            <Link to="/" style={{fontWeight: 700, color: "#404040", fontSize: this.state.siderCollapsed ? 18 : 20}}>
              {this.state.siderCollapsed ? "OD" : "OpenData"}
            </Link>
          </div>
          <div className="sider-menu-container" style={{flex: 1, overflow: "auto", paddingTop: 6}}>
            <Menu
              mode="inline"
              items={this.getMenuItems()}
              selectedKeys={[this.getSelectedMenuKey()]}
              openKeys={this.state.menuOpenKeys}
              onOpenChange={menuOpenKeys => this.setState({menuOpenKeys})}
              style={{borderRight: 0, background: "#fafbfc"}}
            />
          </div>
        </Sider>
        <div style={{marginLeft: contentMarginLeft, transition: "margin-left 0.2s", display: "flex", flexDirection: "column", minHeight: "100vh"}}>
          {this.renderHeader()}
          <Content style={{display: "flex", flexDirection: "column"}}>
            <Card className="content-warp-card" styles={{body: {padding: 0, margin: 0}}}>
              {this.renderRouter()}
            </Card>
          </Content>
        </div>
      </>
    );
  }
}

export default withRouter(ManagementPage);
