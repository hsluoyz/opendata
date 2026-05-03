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

package routers

import (
	"net/http"
	"os"
	"strings"

	"github.com/beego/beego"
	"github.com/beego/beego/context"
)

func StaticFilter(ctx *context.Context) {
	urlPath := ctx.Request.URL.Path

	if strings.HasPrefix(urlPath, "/api/") {
		return
	}

	// serve frontend static files
	frontendDir := beego.AppConfig.DefaultString("frontendBaseDir", "./web/build")
	if frontendDir == "" {
		frontendDir = "./web/build"
	}

	filePath := frontendDir + urlPath
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		// serve index.html for SPA routing
		http.ServeFile(ctx.ResponseWriter, ctx.Request, frontendDir+"/index.html")
		return
	}
	http.ServeFile(ctx.ResponseWriter, ctx.Request, filePath)
}
