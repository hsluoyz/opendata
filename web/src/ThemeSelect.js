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
import {MoonOutlined, SunOutlined} from "@ant-design/icons";

class ThemeSelect extends React.Component {
  handleToggle = () => {
    const isDark = this.props.themeAlgorithm.includes("dark");
    this.props.onChange(isDark ? ["default"] : ["dark"]);
  };

  render() {
    const isDark = this.props.themeAlgorithm.includes("dark");
    return (
      <div
        role="button"
        tabIndex={0}
        title={isDark ? "切换为浅色主题" : "切换为深色主题"}
        onClick={this.handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.handleToggle();
          }
        }}
        style={{cursor: "pointer", display: "flex", alignItems: "center", padding: "0 4px"}}
      >
        {isDark
          ? <SunOutlined style={{fontSize: "18px"}} />
          : <MoonOutlined style={{fontSize: "18px"}} />}
      </div>
    );
  }
}

export default ThemeSelect;
