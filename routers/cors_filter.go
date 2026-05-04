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

	"github.com/beego/beego/context"
)

// CORS header names aligned with Casdoor (routers/cors_filter.go); Allow-Headers also lists
// X-Requested-With because Ant Design Upload sends it on XHR uploads.
const (
	headerAllowOrigin      = "Access-Control-Allow-Origin"
	headerAllowMethods     = "Access-Control-Allow-Methods"
	headerAllowHeaders     = "Access-Control-Allow-Headers"
	headerAllowCredentials = "Access-Control-Allow-Credentials"
)

func CorsFilter(ctx *context.Context) {
	ctx.Output.Header(headerAllowOrigin, ctx.Input.Header("Origin"))
	ctx.Output.Header(headerAllowCredentials, "true")
	ctx.Output.Header(headerAllowHeaders, "Content-Type, Authorization, X-Requested-With")
	ctx.Output.Header(headerAllowMethods, "GET, POST, PUT, DELETE, OPTIONS")

	if ctx.Input.Method() == "OPTIONS" {
		ctx.ResponseWriter.WriteHeader(http.StatusOK)
	}
}
