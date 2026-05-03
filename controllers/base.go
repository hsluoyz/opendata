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

	"github.com/beego/beego"
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
	gob.Register(object.User{})
}

func (c *ApiController) GetSessionUser() *object.User {
	s := c.GetSession("user")
	if s == nil {
		return nil
	}
	user := s.(object.User)
	return &user
}

func (c *ApiController) SetSessionUser(user *object.User) {
	if user == nil {
		c.DelSession("user")
		return
	}
	c.SetSession("user", *user)
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

func DenyRequest(ctx interface{}) {
	// used by routers
}

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
