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

	"github.com/beego/beego/utils/pagination"
	"github.com/the-open-data/opendata/object"
)

func (c *ApiController) GetTeachers() {
	if !c.RequireSignedIn() {
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
		teachers, err := object.GetTeachers(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(teachers)
		return
	}

	limitInt := parseInt(limit)
	count, err := object.GetTeacherCount(owner, field, value)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	paginator := pagination.SetPaginator(c.Ctx, limitInt, count)
	teachers, err := object.GetPaginationTeachers(owner, paginator.Offset(), limitInt, field, value, sortField, sortOrder)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(teachers, paginator.Nums())
}

func (c *ApiController) GetTeacher() {
	if !c.RequireSignedIn() {
		return
	}
	id := c.Input().Get("id")
	teacher, err := object.GetTeacher(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(teacher)
}

func (c *ApiController) AddTeacher() {
	if !c.RequireSignedIn() {
		return
	}
	var teacher object.Teacher
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &teacher); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	teacher.CreatedTime = object.GetCurrentTime()
	affected, err := object.AddTeacher(&teacher)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) UpdateTeacher() {
	if !c.RequireSignedIn() {
		return
	}
	id := c.Input().Get("id")
	var teacher object.Teacher
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &teacher); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	affected, err := object.UpdateTeacher(id, &teacher)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) DeleteTeacher() {
	if !c.RequireSignedIn() {
		return
	}
	var teacher object.Teacher
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &teacher); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	affected, err := object.DeleteTeacher(&teacher)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}
