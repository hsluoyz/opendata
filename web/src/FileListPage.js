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
import {Button, Image, Popconfirm, Popover, Space, Table, Tag, Upload} from "antd";
import {CopyOutlined, FolderOutlined, UploadOutlined} from "@ant-design/icons";
import BaseListPage from "./BaseListPage";
import * as FileBackend from "./backend/FileBackend";
import * as Setting from "./Setting";

class FileListPage extends BaseListPage {
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

  newFile(category = "folder") {
    const school = Setting.getSchool(this.props.account);
    return {
      owner: school || "admin",
      name: `file-${Setting.getRandomName()}`,
      displayName: category === "folder" ? "新文件夹" : "新文件",
      category,
      type: "",
      folder: "",
      school: school || "",
      grade: "",
      class: "",
      subject: "",
      teacher: "",
      student: "",
      parent: "",
      uploader: "",
      tag: "",
      path: "",
      url: "",
      size: 0,
      fileType: "",
      admins: [],
      viewers: [],
    };
  }

  addFolder() {
    const file = this.newFile("folder");
    FileBackend.addFile(file).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "添加文件夹成功");
        this.props.history.push(`/files/${file.owner}/${file.name}`);
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  copyFileUrl(record) {
    const full = Setting.getAbsoluteUrl(record.url);
    if (!full) {
      Setting.showMessage("warning", "无文件链接");
      return;
    }
    navigator.clipboard.writeText(full).then(() => {
      Setting.showMessage("success", "已复制完整URL");
    }).catch(() => {
      Setting.showMessage("error", "复制失败");
    });
  }

  deleteFile(record) {
    FileBackend.deleteFile(record).then(res => {
      if (res.status === "ok") {
        Setting.showMessage("success", "删除成功");
        this.setState({data: this.state.data.filter(f => f.name !== record.name)});
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  handleUpload(info) {
    const {file} = info;
    if (file.status === "done") {
      const res = file.response;
      if (res && res.status === "ok") {
        Setting.showMessage("success", `${file.name} 上传成功`);
        this.fetch({pagination: this.state.pagination});
      } else {
        Setting.showMessage("error", (res && res.msg) || "上传失败");
      }
    } else if (file.status === "error") {
      Setting.showMessage("error", `${file.name} 上传失败`);
    }
  }

  getUploadAction() {
    const school = Setting.getSchool(this.props.account);
    return `${Setting.ServerUrl}/api/upload-file?owner=${school || "admin"}`;
  }

  fetch = (params = {}) => {
    const {pagination, sortField, sortOrder, searchText, searchedColumn} = params;
    const school = Setting.getSchool(this.props.account);
    this.setState({loading: true});
    FileBackend.getFiles(
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

  renderTable(files) {
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        sorter: true,
        ...this.getColumnSearchProps("name"),
        render: (text, record) => (
          <Space>
            {record.category === "folder" && <FolderOutlined style={{color: "#faad14"}} />}
            <Link to={`/files/${record.owner}/${record.name}`}>{record.displayName || text}</Link>
          </Space>
        ),
      },
      {
        title: "预览",
        width: 180,
        render: (_, record) => {
          if (record.category !== "file" || !record.url) {
            return "—";
          }
          if (!Setting.isImageMimeOrExt(record.fileType, record.displayName, record.name)) {
            return "—";
          }
          const src = Setting.getAbsoluteUrl(record.url);
          return (
            <Popover
              placement="right"
              mouseEnterDelay={0.2}
              content={(
                <Image
                  src={src}
                  alt={record.displayName || record.name}
                  width={420}
                  preview={false}
                  style={{maxHeight: 420, objectFit: "contain"}}
                />
              )}
            >
              <div style={{width: 156, height: 112, display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f8fa", border: "1px solid #edf0f5", borderRadius: 6, cursor: "zoom-in"}}>
                <Image
                  src={src}
                  alt={record.displayName || record.name}
                  width={148}
                  height={104}
                  preview={false}
                  style={{objectFit: "contain", borderRadius: 4}}
                />
              </div>
            </Popover>
          );
        },
      },
      {
        title: "类型",
        dataIndex: "category",
        width: 90,
        render: (text) => (
          <Tag color={text === "folder" ? "gold" : "blue"}>
            {text === "folder" ? "文件夹" : "文件"}
          </Tag>
        ),
      },
      {
        title: "文件类型",
        dataIndex: "fileType",
        width: 100,
      },
      {
        title: "大小",
        dataIndex: "size",
        width: 100,
        render: (size) => size ? Setting.formatFileSize(size) : "-",
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
        title: "标签",
        dataIndex: "tag",
      },
      {
        title: "上传者",
        dataIndex: "uploader",
      },
      {
        title: "操作",
        width: 280,
        fixed: "right",
        render: (text, record) => (
          <div>
            <Button
              style={{marginTop: 10, marginBottom: 10, marginRight: 10}}
              type="primary"
              onClick={() => this.props.history.push(`/files/${record.owner}/${record.name}`)}
            >
              编辑
            </Button>
            <Button
              style={{marginTop: 10, marginBottom: 10, marginRight: 10}}
              icon={<CopyOutlined />}
              disabled={!record.url}
              onClick={() => this.copyFileUrl(record)}
            >
              复制链接
            </Button>
            <Popconfirm
              title={`确认删除: ${record.name} ?`}
              onConfirm={() => this.deleteFile(record)}
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
          dataSource={files?.map(f => ({...f, key: f.name}))}
          pagination={this.state.pagination}
          onChange={this.handleTableChange}
          loading={this.getTableLoading()}
          bordered
          size="middle"
          title={() => (
            <div>
              文件列表&nbsp;&nbsp;&nbsp;&nbsp;
              <Button size="small" icon={<FolderOutlined />} onClick={() => this.addFolder()}>新建文件夹</Button>
              <Upload
                name="file"
                action={this.getUploadAction()}
                withCredentials
                onChange={(info) => this.handleUpload(info)}
                showUploadList={false}
              >
                <Button type="primary" size="small" icon={<UploadOutlined />} style={{marginLeft: 8}}>上传文件</Button>
              </Upload>
            </div>
          )}
        />
      </div>
    );
  }
}

export default FileListPage;
