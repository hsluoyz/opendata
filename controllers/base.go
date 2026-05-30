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

package controllers

import (
	"encoding/gob"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/beego/beego"
	"github.com/the-open-data/opendata/auth"
	"github.com/the-open-data/opendata/object"
)

type ApiController struct {
	beego.Controller
}

type Response struct {
	Status string      `json:"status"`
	Msg    string      `json:"msg"`
	Data   interface{} `json:"data"`
	Data2  interface{} `json:"data2"`
}

func init() {
	gob.Register(auth.Claims{})
}

func (c *ApiController) GetSessionClaims() *auth.Claims {
	s := c.GetSession("user")
	if s == nil {
		return nil
	}
	claims := s.(auth.Claims)
	return &claims
}

func (c *ApiController) SetSessionClaims(claims *auth.Claims) {
	if claims == nil {
		c.DelSession("user")
		return
	}
	c.SetSession("user", *claims)
}

func (c *ApiController) GetSessionUser() *auth.User {
	claims := c.GetSessionClaims()
	if claims == nil {
		return nil
	}
	return &claims.User
}

func (c *ApiController) ResponseOk(data ...interface{}) {
	resp := &Response{Status: "ok"}
	switch len(data) {
	case 2:
		resp.Data2 = data[1]
		fallthrough
	case 1:
		resp.Data = data[0]
	}
	c.Data["json"] = resp
	c.ServeJSON()
}

func (c *ApiController) ResponseError(msg string, data ...interface{}) {
	resp := &Response{Status: "error", Msg: msg}
	switch len(data) {
	case 2:
		resp.Data2 = data[1]
		fallthrough
	case 1:
		resp.Data = data[0]
	}
	c.Data["json"] = resp
	c.ServeJSON()
}

func (c *ApiController) RequireSignedIn() bool {
	user := c.GetSessionUser()
	if user == nil {
		c.ResponseError("请先登录")
		return false
	}
	return true
}

func (c *ApiController) RequireAdmin() bool {
	user := c.GetSessionUser()
	if user == nil {
		c.ResponseError("请先登录")
		return false
	}
	if !object.IsAdmin(user) {
		c.ResponseError("需要管理员权限")
		return false
	}
	return true
}

func (c *ApiController) GetBaseUrl() string {
	scheme := "https"
	if c.Ctx.Request.TLS == nil && c.Ctx.Request.Header.Get("X-Forwarded-Proto") != "https" {
		scheme = "http"
	}
	host := c.Ctx.Request.Host
	if strings.HasPrefix(host, "localhost") {
		return "http://localhost:12001"
	}
	return fmt.Sprintf("%s://%s", scheme, host)
}

func DenyRequest(ctx interface{}) {}

func wrapActionResponse(affected bool, err error) *Response {
	if err != nil {
		return &Response{Status: "error", Msg: err.Error()}
	}
	if affected {
		return &Response{Status: "ok", Msg: "", Data: "Affected"}
	}
	return &Response{Status: "ok", Msg: "", Data: "Unaffected"}
}

func parseBody(body []byte, v interface{}) error {
	return json.Unmarshal(body, v)
}

func parseInt(s string) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return i
}
