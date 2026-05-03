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
	"encoding/json"

	"github.com/the-open-data/opendata/object"
)

type SigninRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (c *ApiController) Signin() {
	var req SigninRequest
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &req); err != nil {
		c.ResponseError("请求格式错误")
		return
	}

	user, err := object.GetUserByName(req.Username)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	if user == nil {
		c.ResponseError("用户不存在")
		return
	}
	if !object.CheckPassword(user.Password, req.Password) {
		c.ResponseError("密码错误")
		return
	}

	c.SetSessionUser(user)
	c.ResponseOk(user)
}

func (c *ApiController) Signout() {
	c.SetSessionUser(nil)
	c.ResponseOk()
}

func (c *ApiController) GetAccount() {
	user := c.GetSessionUser()
	if user == nil {
		c.ResponseOk(nil)
		return
	}
	// return user without password
	safe := *user
	safe.Password = ""
	c.ResponseOk(&safe)
}

func (c *ApiController) UpdateAccount() {
	if !c.RequireSignedIn() {
		return
	}
	current := c.GetSessionUser()

	var user object.User
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &user); err != nil {
		c.ResponseError("请求格式错误")
		return
	}

	affected, err := object.UpdateUser(current.Owner+"/"+current.Name, &user)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	// refresh session
	updated, err := object.GetUser(current.Owner + "/" + current.Name)
	if err == nil && updated != nil {
		c.SetSessionUser(updated)
	}

	c.ResponseOk(affected)
}

func (c *ApiController) GetUsers() {
	if !c.RequireAdmin() {
		return
	}
	owner := c.Input().Get("owner")
	limit := c.Input().Get("pageSize")
	page := c.Input().Get("p")
	field := c.Input().Get("field")
	value := c.Input().Get("value")
	sortField := c.Input().Get("sortField")
	sortOrder := c.Input().Get("sortOrder")

	if limit == "" || page == "" {
		users, err := object.GetUsers(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(maskUsers(users))
		return
	}

	limitInt := parseInt(limit)
	pageInt := parseInt(page)
	count, err := object.GetUserCount(owner, field, value)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	users, err := object.GetPaginationUsers(owner, (pageInt-1)*limitInt, limitInt, field, value, sortField, sortOrder)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(maskUsers(users), count)
}

func (c *ApiController) GetUser() {
	if !c.RequireSignedIn() {
		return
	}
	id := c.Input().Get("id")
	user, err := object.GetUser(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	if user != nil {
		user.Password = ""
	}
	c.ResponseOk(user)
}

func (c *ApiController) AddUser() {
	if !c.RequireAdmin() {
		return
	}
	var user object.User
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &user); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	user.CreatedTime = object.GetCurrentTime()
	affected, err := object.AddUser(&user)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) UpdateUser() {
	if !c.RequireAdmin() {
		return
	}
	id := c.Input().Get("id")
	var user object.User
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &user); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	affected, err := object.UpdateUser(id, &user)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) DeleteUser() {
	if !c.RequireAdmin() {
		return
	}
	var user object.User
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &user); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	affected, err := object.DeleteUser(&user)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func maskUsers(users []*object.User) []*object.User {
	for _, u := range users {
		u.Password = ""
	}
	return users
}

func parseInt(s string) int {
	i := 0
	for _, c := range s {
		if c >= '0' && c <= '9' {
			i = i*10 + int(c-'0')
		}
	}
	return i
}
