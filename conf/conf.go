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

package conf

import (
	"os"
	"strconv"

	"github.com/beego/beego"
)

type WebConfig struct {
	AuthConfig struct {
		ServerUrl        string `json:"serverUrl"`
		ClientId         string `json:"clientId"`
		AppName          string `json:"appName"`
		OrganizationName string `json:"organizationName"`
		RedirectPath     string `json:"redirectPath"`
	} `json:"authConfig"`
	StaticBaseUrl    string `json:"staticBaseUrl"`
	HtmlTitle        string `json:"htmlTitle"`
	FaviconUrl       string `json:"faviconUrl"`
	FooterHtml       string `json:"footerHtml"`
	ShowGithubCorner bool   `json:"showGithubCorner"`
	IsDemoMode       bool   `json:"isDemoMode"`
}

func GetConfigString(key string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	res := beego.AppConfig.String(key)
	if res == "" {
		switch key {
		case "logConfig":
			res = `{"adapter":"file","filename":"logs/opendata.log","maxdays":99999,"perm":"0770"}`
		case "redirectPath":
			res = "/callback"
		}
	}
	return res
}

func GetConfigBool(key string) bool {
	return GetConfigString(key) == "true"
}

func GetConfigInt(key string) int {
	value := GetConfigString(key)
	num, err := strconv.Atoi(value)
	if err != nil {
		return 0
	}
	return num
}

func IsDemoMode() bool {
	return GetConfigBool("isDemoMode")
}

func GetWebConfig() *WebConfig {
	config := &WebConfig{}

	config.AuthConfig.ServerUrl = GetConfigString("casdoorEndpoint")
	config.AuthConfig.ClientId = GetConfigString("clientId")
	config.AuthConfig.AppName = GetConfigString("casdoorApplication")
	config.AuthConfig.OrganizationName = GetConfigString("casdoorOrganization")
	config.AuthConfig.RedirectPath = GetConfigString("redirectPath")

	config.StaticBaseUrl = GetConfigString("staticBaseUrl")
	config.HtmlTitle = GetConfigString("htmlTitle")
	config.FaviconUrl = GetConfigString("faviconUrl")
	config.FooterHtml = GetConfigString("footerHtml")
	config.ShowGithubCorner = GetConfigBool("showGithubCorner")
	config.IsDemoMode = GetConfigBool("isDemoMode")

	return config
}
