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
	"github.com/beego/beego/context"
	"github.com/the-open-data/opendata/auth"
)

type Response struct {
	Status string      `json:"status"`
	Msg    string      `json:"msg"`
	Data   interface{} `json:"data"`
}

func GetSessionUser(ctx *context.Context) *auth.User {
	s := ctx.Input.Session("user")
	if s == nil {
		return nil
	}
	claims := s.(auth.Claims)
	return &claims.User
}

func responseError(ctx *context.Context, msg string) {
	resp := Response{Status: "error", Msg: msg}
	err := ctx.Output.JSON(resp, true, false)
	if err != nil {
		panic(err)
	}
}
