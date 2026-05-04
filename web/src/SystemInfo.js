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
import {Card, Col, Progress, Row, Table} from "antd";
import Loading from "./common/Loading";
import * as SystemBackend from "./backend/SystemInfo";
import * as Setting from "./Setting";

class SystemInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      systemInfo: {cpuUsage: [], memoryUsed: 0, memoryTotal: 0, diskUsed: 0, diskTotal: 0, networkSent: 0, networkRecv: 0, networkTotal: 0},
      versionInfo: {},
      prometheusInfo: {apiThroughput: [], apiLatency: [], totalThroughput: 0},
      intervalId: null,
      loading: true,
    };
  }

  UNSAFE_componentWillMount() {
    SystemBackend.getSystemInfo().then(res => {
      this.setState({loading: false});
      if (res.status === "ok") {
        this.setState({systemInfo: res.data});
      } else {
        Setting.showMessage("error", res.msg);
        this.stopTimer();
      }

      const id = setInterval(() => {
        SystemBackend.getSystemInfo().then(res => {
          this.setState({loading: false});
          if (res.status === "ok") {
            this.setState({systemInfo: res.data});
          } else {
            Setting.showMessage("error", res.msg);
            this.stopTimer();
          }
        }).catch(error => {
          Setting.showMessage("error", `获取失败: ${error}`);
          this.stopTimer();
        });
        SystemBackend.getPrometheusInfo().then(res => {
          if (res.status === "ok") {
            this.setState({prometheusInfo: res.data});
          }
        });
      }, 2000);

      this.setState({intervalId: id});
    }).catch(error => {
      Setting.showMessage("error", `获取失败: ${error}`);
      this.stopTimer();
    });

    SystemBackend.getVersionInfo().then(res => {
      if (res.status === "ok") {
        this.setState({versionInfo: res.data});
      } else {
        Setting.showMessage("error", res.msg);
      }
    }).catch(err => {
      Setting.showMessage("error", `获取版本信息失败: ${err}`);
    });
  }

  stopTimer() {
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
    }
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  renderLatencyTable() {
    const {apiLatency} = this.state.prometheusInfo || {};
    const columns = [
      {title: "方法", dataIndex: "method", key: "method"},
      {title: "名称", dataIndex: "name", key: "name"},
      {title: "请求数", dataIndex: "count", key: "count"},
      {title: "平均延迟(ms)", dataIndex: "latency", key: "latency"},
    ];
    return (
      <Table
        dataSource={apiLatency || []}
        columns={columns}
        rowKey={(r) => `${r.method}/${r.name}`}
        size="small"
        pagination={false}
      />
    );
  }

  renderThroughputTable() {
    const {apiThroughput, totalThroughput} = this.state.prometheusInfo || {};
    const columns = [
      {title: "方法", dataIndex: "method", key: "method"},
      {title: "名称", dataIndex: "name", key: "name"},
      {title: "吞吐量(req/s)", dataIndex: "throughput", key: "throughput"},
    ];
    return (
      <div>
        <div style={{marginBottom: 8}}>总吞吐量: <strong>{totalThroughput || 0} req/s</strong></div>
        <Table
          dataSource={apiThroughput || []}
          columns={columns}
          rowKey={(r) => `${r.method}/${r.name}`}
          size="small"
          pagination={false}
        />
      </div>
    );
  }

  render() {
    const {systemInfo, versionInfo, loading} = this.state;

    const cpuUi = (systemInfo.cpuUsage?.length <= 0)
      ? "获取CPU使用率失败"
      : systemInfo.cpuUsage.map((usage, i) => (
        <Progress key={i} percent={Number(usage.toFixed(1))} />
      ));

    const memUi = systemInfo.memoryTotal <= 0
      ? "获取内存使用率失败"
      : (
        <div>
          {Setting.getFriendlyFileSize(systemInfo.memoryUsed)} / {Setting.getFriendlyFileSize(systemInfo.memoryTotal)}
          <br /><br />
          <Progress type="circle" percent={Number((systemInfo.memoryUsed / systemInfo.memoryTotal * 100).toFixed(2))} />
        </div>
      );

    const diskUi = systemInfo.diskTotal <= 0
      ? "获取磁盘使用率失败"
      : (
        <div>
          {Setting.getFriendlyFileSize(systemInfo.diskUsed)} / {Setting.getFriendlyFileSize(systemInfo.diskTotal)}
          <br /><br />
          <Progress type="circle" percent={Number((systemInfo.diskUsed / systemInfo.diskTotal * 100).toFixed(2))} />
        </div>
      );

    const networkUi = (systemInfo.networkTotal === undefined || systemInfo.networkTotal === null)
      ? "获取网络使用率失败"
      : (
        <div>
          发送: {Setting.getFriendlyFileSize(systemInfo.networkSent)}
          <br />
          接收: {Setting.getFriendlyFileSize(systemInfo.networkRecv)}
          <br /><br />
          <div style={{fontSize: "16px", fontWeight: "600"}}>
            总流量: {Setting.getFriendlyFileSize(systemInfo.networkTotal)}
          </div>
        </div>
      );

    let versionText = versionInfo?.version !== "" ? versionInfo?.version : "未知版本";
    if (versionInfo?.commitOffset > 0) {
      versionText += ` (ahead+${versionInfo?.commitOffset})`;
    }
    const link = versionInfo?.version ? `https://github.com/the-open-data/opendata/releases/tag/${versionInfo?.version}` : "";

    if (!Setting.isMobile()) {
      return (
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card title="网络使用" bordered style={{textAlign: "center", height: "100%"}}>
              {loading ? <Loading /> : networkUi}
            </Card>
          </Col>
          <Col span={6}>
            <Card title="CPU使用" bordered style={{textAlign: "center", height: "100%"}}>
              {loading ? <Loading /> : cpuUi}
            </Card>
          </Col>
          <Col span={6}>
            <Card title="内存使用" bordered style={{textAlign: "center", height: "100%"}}>
              {loading ? <Loading /> : memUi}
            </Card>
          </Col>
          <Col span={6}>
            <Card title="磁盘使用" bordered style={{textAlign: "center", height: "100%"}}>
              {loading ? <Loading /> : diskUi}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="API延迟" bordered style={{textAlign: "center", height: "100%"}}>
              {loading ? <Loading /> : this.renderLatencyTable()}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="API吞吐量" bordered style={{textAlign: "center", height: "100%"}}>
              {loading ? <Loading /> : this.renderThroughputTable()}
            </Card>
          </Col>
          <Col span={24}>
            <Card title="关于本系统" bordered style={{textAlign: "center"}}>
              开源项目：<a target="_blank" rel="noreferrer" href="https://github.com/the-open-data/opendata">OpenData（GitHub）</a>
              <br />
              版本: <a target="_blank" rel="noreferrer" href={link}>{versionText}</a>
            </Card>
          </Col>
        </Row>
      );
    } else {
      return (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="网络使用" bordered style={{textAlign: "center", width: "100%"}}>
              {loading ? <Loading /> : networkUi}
            </Card>
          </Col>
          <Col span={24}>
            <Card title="CPU使用" bordered style={{textAlign: "center", width: "100%"}}>
              {loading ? <Loading /> : cpuUi}
            </Card>
          </Col>
          <Col span={24}>
            <Card title="内存使用" bordered style={{textAlign: "center", width: "100%"}}>
              {loading ? <Loading /> : memUi}
            </Card>
          </Col>
          <Col span={24}>
            <Card title="磁盘使用" bordered style={{textAlign: "center", width: "100%"}}>
              {loading ? <Loading /> : diskUi}
            </Card>
          </Col>
          <Col span={24}>
            <Card title="关于本系统" bordered style={{textAlign: "center"}}>
              开源项目：<a target="_blank" rel="noreferrer" href="https://github.com/the-open-data/opendata">OpenData（GitHub）</a>
              <br />
              版本: <a target="_blank" rel="noreferrer" href={link}>{versionText}</a>
            </Card>
          </Col>
        </Row>
      );
    }
  }
}

export default SystemInfo;
