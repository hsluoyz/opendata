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
  ApiOutlined,
  AuditOutlined,
  BankOutlined,
  BookOutlined,
  CloudOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DownOutlined,
  FolderOpenOutlined,
  FundOutlined,
  HeartOutlined,
  HomeOutlined,
  LayoutOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import ThemeSelect from "./ThemeSelect";
import * as AccountBackend from "./backend/AccountBackend";
import * as SchoolBackend from "./backend/SchoolBackend";
import * as GradeBackend from "./backend/GradeBackend";
import * as ClassBackend from "./backend/ClassBackend";
import * as Setting from "./Setting";
import BreadcrumbBar from "./common/BreadcrumbBar";
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
import RecordListPage from "./RecordListPage";
import SessionListPage from "./SessionListPage";
import SiteListPage from "./SiteListPage";
import SiteEditPage from "./SiteEditPage";
import VisitorPage from "./VisitorPage";
import SystemInfo from "./SystemInfo";

const {Header, Content, Footer, Sider} = Layout;
const siderMenuOpenKeysStorageKey = "siderMenuOpenKeys";
const defaultMenuOpenKeys = ["/education", "/people", "/storage", "/logs", "/admin"];

function readSavedMenuOpenKeys() {
  try {
    const raw = localStorage.getItem(siderMenuOpenKeysStorageKey);
    if (!raw) {
      return defaultMenuOpenKeys;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(key => typeof key === "string") : defaultMenuOpenKeys;
  } catch {
    return defaultMenuOpenKeys;
  }
}

function persistMenuOpenKeys(keys) {
  try {
    localStorage.setItem(siderMenuOpenKeysStorageKey, JSON.stringify(keys));
  } catch {
    return;
  }
}

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
  if (uri.includes("/records") || uri.includes("/sessions")) {
    return "/logs";
  }
  if (uri.includes("/sites") || uri.includes("/visitors") || uri.includes("/sysinfo") || uri.includes("/swagger")) {
    return "/admin";
  }
  return null;
}

class ManagementPage extends React.Component {
  constructor(props) {
    super(props);
    const siderCollapsed = localStorage.getItem("siderCollapsed") === "true";
    const parentKey = getMenuParentKey(props.location.pathname);
    const savedMenuOpenKeys = readSavedMenuOpenKeys();
    const menuOpenKeys = new Set(savedMenuOpenKeys);
    if (parentKey) {
      menuOpenKeys.add(parentKey);
    }
    this.state = {
      schools: [],
      grades: [],
      classes: [],
      selectedSchool: localStorage.getItem("selectedSchool") || "",
      selectedGrade: localStorage.getItem("selectedGrade") || "",
      selectedClass: localStorage.getItem("selectedClass") || "",
      siderCollapsed,
      menuOpenKeys: siderCollapsed ? [] : [...menuOpenKeys],
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
        const menuOpenKeys = [...this.state.menuOpenKeys, parentKey];
        persistMenuOpenKeys(menuOpenKeys);
        this.setState({menuOpenKeys});
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
    if (path === "/" || path === "") {
      return "/";
    }
    if (path === "/sites" || path.startsWith("/sites/")) {
      return path;
    }
    const firstSeg = path.split("/").filter(Boolean)[0] || "";
    return `/${firstSeg}`;
  }

  handleSignout() {
    AccountBackend.signout().then(() => {
      Setting.showMessage("success", "已退出登录");
      this.props.onSignout?.();
      this.props.history.push("/signin");
    });
  }

  toggleSider = () => {
    const siderCollapsed = !this.state.siderCollapsed;
    localStorage.setItem("siderCollapsed", String(siderCollapsed));
    this.setState({
      siderCollapsed,
      menuOpenKeys: siderCollapsed ? [] : readSavedMenuOpenKeys(),
    });
  };

  onMenuOpenChange = (menuOpenKeys) => {
    persistMenuOpenKeys(menuOpenKeys);
    this.setState({menuOpenKeys});
  };

  getMenuItems() {
    const items = [
      Setting.getItem(<Link to="/">首页</Link>, "/", <HomeOutlined />),
      Setting.getItem("教务管理", "/education", <DatabaseOutlined />, [
        Setting.getItem(<Link to="/schools">学校</Link>, "/schools", <BankOutlined />),
        Setting.getItem(<Link to="/grades">年级</Link>, "/grades", <ApartmentOutlined />),
        Setting.getItem(<Link to="/classes">班级</Link>, "/classes", <TeamOutlined />),
        Setting.getItem(<Link to="/subjects">学科</Link>, "/subjects", <BookOutlined />),
      ]),
      Setting.getItem("人员管理", "/people", <UserOutlined />, [
        Setting.getItem(<Link to="/teachers">教师</Link>, "/teachers", <UserOutlined />),
        Setting.getItem(<Link to="/students">学生</Link>, "/students", <SolutionOutlined />),
        Setting.getItem(<Link to="/parents">家长</Link>, "/parents", <HeartOutlined />),
      ]),
      Setting.getItem("存储管理", "/storage", <CloudOutlined />, [
        Setting.getItem(<Link to="/files">文件</Link>, "/files", <FolderOpenOutlined />),
      ]),
      Setting.getItem("审计日志", "/logs", <AuditOutlined />, [
        Setting.getItem(<Link to="/records">日志</Link>, "/records", <DatabaseOutlined />),
        Setting.getItem(<Link to="/sessions">会话</Link>, "/sessions", <OrderedListOutlined />),
      ]),
    ];

    if (Setting.isAdminUser(this.props.account)) {
      items[3].children.push(Setting.getItem(<Link to="/providers">存储提供商</Link>, "/providers", <CloudOutlined />));
      items.push(Setting.getItem("管理", "/admin", <SettingOutlined />, [
        Setting.getItem(<Link to="/sites/site-built-in">设置</Link>, "/sites/site-built-in", <LayoutOutlined />),
        Setting.getItem(<Link to="/visitors">访客</Link>, "/visitors", <FundOutlined />),
        Setting.getItem(<Link to="/sysinfo">系统信息</Link>, "/sysinfo", <DashboardOutlined />),
        Setting.getItem(
          <a target="_blank" rel="noreferrer" href={Setting.isLocalhost() ? `${Setting.ServerUrl}/swagger/index.html` : "/swagger/index.html"}>
            API 文档
          </a>,
          "/swagger",
          <ApiOutlined />
        ),
      ]));
    }
    return items;
  }

  renderAccountMenu() {
    const {account} = this.props;
    const items = [
      {
        key: "/account",
        icon: <SettingOutlined />,
        label: "我的账号",
        onClick: () => Setting.openLink(Setting.getMyProfileUrl(account)),
      },
      {
        type: "divider",
      },
      {
        key: "/logout",
        icon: <LogoutOutlined />,
        label: "退出登录",
        onClick: () => this.handleSignout(),
      },
    ];
    return (
      <Dropdown menu={{items}}>
        <div className="rightDropDown" style={{display: "flex", alignItems: "center", cursor: "pointer", padding: "0 4px"}}>
          {account?.avatar
            ? <Avatar src={account.avatar} size={32} />
            : <Avatar style={{backgroundColor: Setting.getAvatarColor(account?.name)}} size={32}>
              {Setting.getShortName(account?.displayName || account?.name)}
            </Avatar>
          }
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
    const isDark = this.props.themeAlgorithm?.includes("dark");

    return (
      <Header style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px 0 0", backgroundColor: isDark ? "#141414" : "#fbfdff", position: "sticky", top: 0, zIndex: 99, borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #dbe7f7", height: 52, lineHeight: "52px", boxShadow: isDark ? "none" : "0 1px 0 rgb(21 101 192 / 6%)"}}>
        <div style={{display: "flex", alignItems: "center"}}>
          <Button
            icon={this.state.siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={this.toggleSider}
            type="text"
            style={{fontSize: 16, width: 40, height: 40}}
          />
          <BreadcrumbBar uri={this.props.location.pathname} />
        </div>
        <Space size={8}>
          <Select placeholder="学校" value={selectedSchool || undefined} onChange={value => Setting.setSchool(value || "")} allowClear style={{width: 160}} options={schools.map(s => ({value: s.name, label: s.displayName || s.name}))} />
          <Select placeholder="年级" value={selectedGrade || undefined} onChange={value => Setting.setGrade(value || "")} allowClear style={{width: 130}} disabled={!selectedSchool} options={grades.map(g => ({value: g.name, label: g.displayName || g.name}))} />
          <Select placeholder="班级" value={selectedClass || undefined} onChange={value => Setting.setClass(value || "")} allowClear style={{width: 130}} disabled={!selectedGrade} options={filteredClasses.map(c => ({value: c.name, label: c.displayName || c.name}))} />
          <ThemeSelect themeAlgorithm={this.props.themeAlgorithm} onChange={this.props.onThemeChange} />
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
        <Route exact path="/records" render={props => <RecordListPage {...props} account={account} />} />
        <Route exact path="/sessions" render={props => <SessionListPage {...props} account={account} />} />
        <Route exact path="/sites" render={props => <SiteListPage {...props} account={account} />} />
        <Route exact path="/sites/:siteName" render={props => <SiteEditPage {...props} account={account} />} />
        <Route exact path="/visitors" render={props => <VisitorPage {...props} account={account} themeAlgorithm={this.props.themeAlgorithm} />} />
        <Route exact path="/sysinfo" render={props => <SystemInfo {...props} account={account} />} />
        <Route path="" render={() => <Result status="404" title="404 未找到" extra={<a href="/"><Button type="primary">返回首页</Button></a>} />} />
      </Switch>
    );
  }

  render() {
    const siderWidth = 256;
    const siderCollapsedWidth = 80;
    const contentMarginLeft = this.state.siderCollapsed ? siderCollapsedWidth : siderWidth;
    const isDark = this.props.themeAlgorithm?.includes("dark");
    const logo = Setting.getLogo(this.props.themeAlgorithm, this.props.site?.logoUrl);
    const faviconUrl = Setting.getFaviconUrl(this.props.themeAlgorithm, this.props.site?.faviconUrl);
    const footerHtml = Setting.getFooterHtml(this.props.themeAlgorithm, this.props.site?.footerHtml);

    const brandHeight = this.state.siderCollapsed ? 52 : 72;

    return (
      <div id="parent-area">
        <Sider
          collapsed={this.state.siderCollapsed}
          collapsedWidth={siderCollapsedWidth}
          width={siderWidth}
          trigger={null}
          theme={isDark ? "dark" : "light"}
          style={{
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            borderRight: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #dbe7f7",
            background: isDark ? "#141414" : "#f0f6ff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="edu-sider-brand"
            style={{
              minHeight: brandHeight,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: this.state.siderCollapsed ? "center" : "flex-start",
              padding: this.state.siderCollapsed ? 0 : "10px 16px 10px 12px",
              overflow: "hidden",
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #dbe7f7",
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: this.state.siderCollapsed ? "center" : "flex-start",
                width: "100%",
              }}
            >
              {this.state.siderCollapsed
                ? faviconUrl
                  ? (
                    <img
                      src={faviconUrl}
                      alt="logo"
                      style={{
                        width: 30,
                        height: 30,
                        objectFit: "contain",
                        borderRadius: 6,
                      }}
                    />
                  )
                  : <span className="edu-sider-title-mark">教</span>
                : (
                  <div style={{display: "flex", alignItems: "center", gap: 8, minWidth: 0}}>
                    {logo && (
                      <img
                        src={logo}
                        alt="logo"
                        style={{
                          width: 90,
                          height: 46,
                          objectFit: "contain",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{minWidth: 0}}>
                      <div className="edu-sider-title-main" style={{color: isDark ? "#ffffff" : "#0d47a1", fontSize: 17}}>教育数据平台</div>
                      <div className="edu-sider-title-sub" style={{color: isDark ? "rgba(255,255,255,0.7)" : "#546e7a"}}>规范 · 阳光 · 服务师生</div>
                    </div>
                  </div>
                )}
            </Link>
          </div>
          <div className="sider-menu-container" style={{flex: 1, overflow: "auto", paddingTop: 6}}>
            <Menu
              mode="inline"
              items={this.getMenuItems()}
              selectedKeys={[this.getSelectedMenuKey()]}
              openKeys={this.state.menuOpenKeys}
              onOpenChange={this.onMenuOpenChange}
              theme={isDark ? "dark" : "light"}
              style={{borderRight: 0, background: isDark ? "#141414" : "#f0f6ff"}}
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
          <Footer id="footer" style={{textAlign: "center", minHeight: 44, padding: "12px 50px", background: isDark ? "#141414" : "#fbfdff"}}>
            <div dangerouslySetInnerHTML={{__html: footerHtml}} />
          </Footer>
        </div>
      </div>
    );
  }
}

export default withRouter(ManagementPage);
