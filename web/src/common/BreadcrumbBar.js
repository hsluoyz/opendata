// Copyright 2026 The OpenData Authors. All Rights Reserved.
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
import {Breadcrumb} from "antd";
import {Link} from "react-router-dom";

const resourceLabels = {
  schools: "学校",
  grades: "年级",
  classes: "班级",
  subjects: "学科",
  teachers: "教师",
  students: "学生",
  parents: "家长",
  files: "文件",
  providers: "存储提供商",
  records: "日志",
  sessions: "会话",
  sites: "设置",
  visitors: "访客",
  sysinfo: "系统信息",
};

function buildBreadcrumbItems(uri) {
  const segments = (uri || "").split("/").filter(Boolean);
  const homeItem = {title: <Link to="/">首页</Link>};

  if (segments.length === 0) {
    return null;
  }

  const rootSegment = segments[0];
  const rootLabel = resourceLabels[rootSegment];
  if (!rootLabel) {
    return null;
  }

  if (segments.length === 1) {
    return [
      homeItem,
      {title: rootLabel},
    ];
  }

  const lastSegment = segments[segments.length - 1];
  const lastLabel = resourceLabels[lastSegment] || decodeURIComponent(lastSegment);
  return [
    homeItem,
    {title: <Link to={`/${rootSegment}`}>{rootLabel}</Link>},
    {title: lastLabel},
  ];
}

const BreadcrumbBar = ({uri}) => {
  const items = buildBreadcrumbItems(uri);
  if (!items) {
    return null;
  }
  return <Breadcrumb items={items} style={{marginLeft: 8}} />;
};

export default BreadcrumbBar;
