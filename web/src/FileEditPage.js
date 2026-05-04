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
import {Button, Card, Form, Input, Select, Spin} from "antd";
import * as FileBackend from "./backend/FileBackend";
import * as Setting from "./Setting";

class FileEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    const {owner, name} = this.props.match.params;
    FileBackend.getFile(owner, name).then(res => {
      if (res.status === "ok") {
        this.setState({file: res.data, loading: false});
      } else {
        Setting.showMessage("error", res.msg);
        this.setState({loading: false});
      }
    });
  }

  updateField(key, value) {
    this.setState(prev => ({file: {...prev.file, [key]: value}}));
  }

  save(exitAfterSave = false) {
    const {file} = this.state;
    FileBackend.updateFile(file.owner, file.name, file).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "保存成功");
        if (exitAfterSave) {
          this.props.history.push("/files");
        }
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  render() {
    const {file, loading} = this.state;

    if (loading) {
      return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: 300}}>
          <Spin size="large" />
        </div>
      );
    }

    if (!file) {return null;}

    return (
      <div>
        <Card
          size="small"
          title={
            <div>
              {`编辑${file.category === "folder" ? "文件夹" : "文件"}`}&nbsp;&nbsp;&nbsp;&nbsp;
              <Button onClick={() => this.save(false)}>保存</Button>
              <Button style={{marginLeft: 20}} type="primary" onClick={() => this.save(true)}>保存并退出</Button>
            </div>
          }
          style={{marginLeft: 5}}
          type="inner"
        >
          <Form layout="vertical">
            <Form.Item label="所有者">
              <Input value={file.owner} disabled />
            </Form.Item>
            <Form.Item label="名称">
              <Input value={file.name} disabled />
            </Form.Item>
            <Form.Item label="显示名">
              <Input
                value={file.displayName}
                onChange={e => this.updateField("displayName", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="类型">
              <Select
                value={file.category}
                onChange={v => this.updateField("category", v)}
                options={[
                  {value: "file", label: "文件"},
                  {value: "folder", label: "文件夹"},
                ]}
              />
            </Form.Item>
            <Form.Item label="文件类型">
              <Input
                value={file.fileType}
                onChange={e => this.updateField("fileType", e.target.value)}
                placeholder="如: pdf, docx, jpg"
              />
            </Form.Item>
            <Form.Item label="所属文件夹">
              <Input
                value={file.folder}
                onChange={e => this.updateField("folder", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="标签">
              <Input
                value={file.tag}
                onChange={e => this.updateField("tag", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="学校">
              <Input value={file.school} disabled />
            </Form.Item>
            <Form.Item label="年级">
              <Input value={file.grade} disabled />
            </Form.Item>
            <Form.Item label="班级">
              <Input value={file.class} disabled />
            </Form.Item>
            <Form.Item label="学科">
              <Input value={file.subject} disabled />
            </Form.Item>
            <Form.Item label="教师">
              <Input value={file.teacher} disabled />
            </Form.Item>
            <Form.Item label="学生">
              <Input value={file.student} disabled />
            </Form.Item>
            <Form.Item label="上传者">
              <Input value={file.uploader} disabled />
            </Form.Item>
            {file.url && (
              <Form.Item label="文件链接">
                <a href={file.url} target="_blank" rel="noopener noreferrer">{file.url}</a>
              </Form.Item>
            )}
            {file.size > 0 && (
              <Form.Item label="文件大小">
                <span>{Setting.formatFileSize(file.size)}</span>
              </Form.Item>
            )}
            <Form.Item label="管理员">
              <Select
                mode="tags"
                value={file.admins || []}
                onChange={v => this.updateField("admins", v)}
                placeholder="输入管理员账户名后回车"
              />
            </Form.Item>
            <Form.Item label="查看者">
              <Select
                mode="tags"
                value={file.viewers || []}
                onChange={v => this.updateField("viewers", v)}
                placeholder="输入查看者账户名后回车"
              />
            </Form.Item>
          </Form>
        </Card>
        <div style={{marginTop: 20, marginLeft: 40}}>
          <Button size="large" onClick={() => this.save(false)}>保存</Button>
          <Button style={{marginLeft: 20}} type="primary" size="large" onClick={() => this.save(true)}>保存并退出</Button>
        </div>
      </div>
    );
  }
}

export default FileEditPage;
