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

func (c *ApiController) GetStudents() {
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
		students, err := object.GetStudents(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(students)
		return
	}

	limitInt := parseInt(limit)
	count, err := object.GetStudentCount(owner, field, value)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	paginator := pagination.SetPaginator(c.Ctx, limitInt, count)
	students, err := object.GetPaginationStudents(owner, paginator.Offset(), limitInt, field, value, sortField, sortOrder)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(students, paginator.Nums())
}

func (c *ApiController) GetStudent() {
	if !c.RequireSignedIn() {
		return
	}
	id := c.Input().Get("id")
	student, err := object.GetStudent(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(student)
}

func (c *ApiController) AddStudent() {
	if !c.RequireSignedIn() {
		return
	}
	var student object.Student
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &student); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	student.CreatedTime = object.GetCurrentTime()
	affected, err := object.AddStudent(&student)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) UpdateStudent() {
	if !c.RequireSignedIn() {
		return
	}
	id := c.Input().Get("id")
	var student object.Student
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &student); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	affected, err := object.UpdateStudent(id, &student)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) DeleteStudent() {
	if !c.RequireSignedIn() {
		return
	}
	var student object.Student
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &student); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	affected, err := object.DeleteStudent(&student)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}
