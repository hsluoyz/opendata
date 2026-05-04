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

package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/beego/beego"
	"github.com/beego/beego/logs"
	_ "github.com/beego/beego/session/redis"
	"github.com/the-open-data/opendata/conf"
	"github.com/the-open-data/opendata/object"
	"github.com/the-open-data/opendata/routers"
	"golang.org/x/net/proxy"
)

func initSocks5Proxy() {
	socks5Proxy := conf.GetConfigString("socks5Proxy")
	if socks5Proxy == "" {
		return
	}

	conn, err := net.DialTimeout("tcp", socks5Proxy, 100*time.Millisecond)
	if err != nil {
		beego.Warning("socks5Proxy configured but unreachable:", socks5Proxy)
		return
	}
	conn.Close()

	dialer, err := proxy.SOCKS5("tcp", socks5Proxy, nil, proxy.Direct)
	if err != nil {
		beego.Warning("Failed to create SOCKS5 dialer:", err)
		return
	}

	http.DefaultTransport = &http.Transport{
		Dial:            dialer.Dial,
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	beego.Info("SOCKS5 proxy enabled:", socks5Proxy)
}

func main() {
	object.InitAdapter()
	object.CreateTables()
	object.InitDefaultProvider()
	object.InitBuiltInSite()

	initSocks5Proxy()

	beego.InsertFilter("*", beego.BeforeRouter, routers.CorsFilter)
	beego.InsertFilter("*", beego.BeforeRouter, routers.AuthzFilter)
	beego.InsertFilter("*", beego.BeforeRouter, routers.StaticFilter)
	beego.InsertFilter("*", beego.BeforeRouter, routers.RecordMessage)
	beego.InsertFilter("*", beego.AfterExec, routers.AfterRecordMessage, false)

	beego.BConfig.WebConfig.Session.SessionOn = true
	beego.BConfig.WebConfig.Session.SessionName = "opendata_session_id"
	if conf.GetConfigString("redisEndpoint") == "" {
		beego.BConfig.WebConfig.Session.SessionProvider = "file"
		beego.BConfig.WebConfig.Session.SessionProviderConfig = "./tmp"
	} else {
		beego.BConfig.WebConfig.Session.SessionProvider = "redis"
		beego.BConfig.WebConfig.Session.SessionProviderConfig = conf.GetConfigString("redisEndpoint")
	}
	beego.BConfig.WebConfig.Session.SessionGCMaxLifetime = 3600 * 24 * 365
	beego.BConfig.WebConfig.Session.SessionCookieSameSite = http.SameSiteLaxMode

	var logAdapter string
	logConfigMap := make(map[string]interface{})
	logConfigStr := conf.GetConfigString("logConfig")
	err := json.Unmarshal([]byte(logConfigStr), &logConfigMap)
	if err != nil {
		logAdapter = "console"
	} else {
		if adapter, ok := logConfigMap["adapter"].(string); ok {
			logAdapter = adapter
		} else {
			logAdapter = "file"
		}
	}

	if logAdapter == "console" {
		logs.Reset()
	} else {
		err = logs.SetLogger(logAdapter, logConfigStr)
		if err != nil {
			logs.Reset()
		}
	}

	port := beego.AppConfig.DefaultInt("httpport", 14001)
	fmt.Printf("OpenData server started on port %d\n", port)
	beego.Run(fmt.Sprintf(":%v", port))
}
