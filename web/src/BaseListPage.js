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
import {Button, Input, Space} from "antd";
import {SearchOutlined} from "@ant-design/icons";

class BaseListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      pagination: {current: 1, pageSize: 10},
      loading: false,
      searchText: "",
      searchedColumn: "",
      selectedRowKeys: [],
      selectedRows: [],
    };
    this.searchInput = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.fetch({pagination: this.state.pagination});
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.fetch({
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination,
      ...filters,
    });
  };

  getRowSelection = () => ({
    selectedRowKeys: this.state.selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => this.setState({selectedRowKeys, selectedRows}),
  });

  clearSelection = () => {
    this.setState({selectedRowKeys: [], selectedRows: []});
  };

  performBulkDelete = async(selectedRows) => {
    this.setState({loading: true});
    await Promise.all(selectedRows.map(row => this.deleteItemByRecord(row)));
    this.clearSelection();
    this.fetch({pagination: this.state.pagination});
  };

  deleteItemByRecord = async(record) => {
    const index = this.state.data.findIndex(item => item.name === record.name);
    return this.deleteItem(index);
  };

  getTableLoading = () => {
    return this.state.loading ? {tip: "加载中"} : false;
  };

  getColumnSearchProps(dataIndex) {
    return {
      filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
        <div style={{padding: 8}} onKeyDown={e => e.stopPropagation()}>
          <Input
            ref={this.searchInput}
            placeholder={`搜索 ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            style={{marginBottom: 8, display: "block"}}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{width: 90}}
            >
              搜索
            </Button>
            <Button
              onClick={() => this.handleReset(clearFilters, confirm)}
              size="small"
              style={{width: 90}}
            >
              重置
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => (
        <SearchOutlined style={{color: filtered ? "#1677ff" : undefined}} />
      ),
      onFilter: (value, record) => {
        const val = record[dataIndex];
        if (val === null || val === undefined) {return false;}
        return val.toString().toLowerCase().includes(value.toLowerCase());
      },
      onFilterDropdownOpenChange: visible => {
        if (visible) {
          setTimeout(() => this.searchInput.current?.select(), 100);
        }
      },
      render: text => {
        const {searchedColumn, searchText} = this.state;
        if (searchedColumn === dataIndex && searchText && text) {
          const str = text.toString();
          const idx = str.toLowerCase().indexOf(searchText.toLowerCase());
          if (idx >= 0) {
            return (
              <span>
                {str.slice(0, idx)}
                <span style={{backgroundColor: "#ffc069"}}>{str.slice(idx, idx + searchText.length)}</span>
                {str.slice(idx + searchText.length)}
              </span>
            );
          }
        }
        return text;
      },
    };
  }

  handleSearch(selectedKeys, confirm, dataIndex) {
    confirm();
    const searchText = selectedKeys[0] || "";
    this.setState({searchText, searchedColumn: dataIndex});
    this.fetch({
      pagination: {current: 1, pageSize: this.state.pagination.pageSize},
      searchText,
      searchedColumn: dataIndex,
    });
  }

  handleReset(clearFilters, confirm) {
    clearFilters();
    this.setState({searchText: "", searchedColumn: ""});
    confirm();
    this.fetch({pagination: {current: 1, pageSize: this.state.pagination.pageSize}});
  }

  fetch(params = {}) {
    // To be implemented by subclass
  }

  renderTable(data) {
    // To be implemented by subclass
    return null;
  }

  render() {
    const {data, loading} = this.state;
    return (
      <div>
        {this.renderTable(data, loading)}
      </div>
    );
  }
}

export default BaseListPage;
