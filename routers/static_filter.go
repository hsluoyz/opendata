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
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/beego/beego"
	"github.com/beego/beego/context"
)

func getWebBuildFolder() string {
	// Default: web/build relative to working directory
	if _, err := os.Stat(filepath.Join("web/build", "index.html")); err == nil {
		return "web/build"
	}

	frontendBaseDir := beego.AppConfig.DefaultString("frontendBaseDir", "")
	if frontendBaseDir == "" {
		return "web/build"
	}

	// Try frontendBaseDir/web/build
	candidate := filepath.Join(frontendBaseDir, "web/build")
	if _, err := os.Stat(filepath.Join(candidate, "index.html")); err == nil {
		return candidate
	}

	// Try frontendBaseDir directly
	if _, err := os.Stat(filepath.Join(frontendBaseDir, "index.html")); err == nil {
		return frontendBaseDir
	}

	return "web/build"
}

func StaticFilter(ctx *context.Context) {
	urlPath := ctx.Request.URL.Path

	if strings.HasPrefix(urlPath, "/api/") {
		return
	}
	if strings.HasPrefix(urlPath, "/swagger/") {
		http.ServeFile(ctx.ResponseWriter, ctx.Request, "."+urlPath)
		return
	}

	webBuildFolder := getWebBuildFolder()

	var filePath string
	if urlPath == "/" {
		filePath = filepath.Join(webBuildFolder, "index.html")
	} else {
		filePath = filepath.Join(webBuildFolder, urlPath)
	}

	// Path traversal guard + SPA fallback
	if strings.Contains(filePath, ".."+string(filepath.Separator)) || strings.Contains(filePath, "../") {
		filePath = filepath.Join(webBuildFolder, "index.html")
	} else if _, err := os.Stat(filePath); os.IsNotExist(err) {
		filePath = filepath.Join(webBuildFolder, "index.html")
	}

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		dir, _ := os.Getwd()
		dir = strings.ReplaceAll(dir, "\\", "/")
		ctx.ResponseWriter.WriteHeader(http.StatusNotFound)
		msg := fmt.Sprintf("OpenData frontend file \"index.html\" not found; expected at: %s/web/build/index.html", dir)
		http.ServeContent(ctx.ResponseWriter, ctx.Request, "error", time.Now(), strings.NewReader(msg))
		return
	}

	http.ServeFile(ctx.ResponseWriter, ctx.Request, filePath)
}
