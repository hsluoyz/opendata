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

package object

import (
	"fmt"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	io_prometheus_client "github.com/prometheus/client_model/go"
)

type PrometheusInfo struct {
	ApiThroughput   []GaugeVecInfo     `json:"apiThroughput"`
	ApiLatency      []HistogramVecInfo `json:"apiLatency"`
	TotalThroughput float64            `json:"totalThroughput"`
}

type GaugeVecInfo struct {
	Method     string  `json:"method"`
	Name       string  `json:"name"`
	Throughput float64 `json:"throughput"`
}

type HistogramVecInfo struct {
	Method  string `json:"method"`
	Name    string `json:"name"`
	Count   uint64 `json:"count"`
	Latency string `json:"latency"`
}

var (
	ApiThroughput = promauto.NewGaugeVec(prometheus.GaugeOpts{
		Name: "opendata_api_throughput",
		Help: "The throughput of each api access",
	}, []string{"path", "method"})

	ApiLatency = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name: "opendata_api_latency",
		Help: "API processing latency in milliseconds",
	}, []string{"path", "method"})

	TotalThroughput = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "opendata_total_throughput",
		Help: "The total throughput of opendata",
	})
)

func ClearThroughputPerSecond() {
	ticker := time.NewTicker(time.Second)
	for range ticker.C {
		ApiThroughput.Reset()
		TotalThroughput.Set(0)
	}
}

func GetPrometheusInfo() (*PrometheusInfo, error) {
	res := &PrometheusInfo{}
	metricFamilies, err := prometheus.DefaultGatherer.Gather()
	if err != nil {
		return nil, err
	}
	for _, mf := range metricFamilies {
		switch mf.GetName() {
		case "opendata_api_throughput":
			res.ApiThroughput = getGaugeVecInfo(mf)
		case "opendata_api_latency":
			res.ApiLatency = getHistogramVecInfo(mf)
		case "opendata_total_throughput":
			res.TotalThroughput = mf.GetMetric()[0].GetGauge().GetValue()
		}
	}
	return res, nil
}

func getHistogramVecInfo(mf *io_prometheus_client.MetricFamily) []HistogramVecInfo {
	var infos []HistogramVecInfo
	for _, metric := range mf.GetMetric() {
		count := metric.GetHistogram().GetSampleCount()
		sum := metric.GetHistogram().GetSampleSum()
		latency := 0.0
		if count > 0 {
			latency = sum / float64(count)
		}
		infos = append(infos, HistogramVecInfo{
			Method:  metric.Label[0].GetValue(),
			Name:    metric.Label[1].GetValue(),
			Count:   count,
			Latency: fmt.Sprintf("%.3f", latency),
		})
	}
	return infos
}

func getGaugeVecInfo(mf *io_prometheus_client.MetricFamily) []GaugeVecInfo {
	var infos []GaugeVecInfo
	for _, metric := range mf.GetMetric() {
		infos = append(infos, GaugeVecInfo{
			Method:     metric.Label[0].GetValue(),
			Name:       metric.Label[1].GetValue(),
			Throughput: metric.Gauge.GetValue(),
		})
	}
	return infos
}
