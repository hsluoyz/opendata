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

func (c *ApiController) GetGrades() {
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
		grades, err := object.GetGrades(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(grades)
		return
	}

	limitInt := parseInt(limit)
	count, err := object.GetGradeCount(owner, field, value)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	paginator := pagination.SetPaginator(c.Ctx, limitInt, count)
	grades, err := object.GetPaginationGrades(owner, paginator.Offset(), limitInt, field, value, sortField, sortOrder)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(grades, paginator.Nums())
}

func (c *ApiController) GetGrade() {
	if !c.RequireSignedIn() {
		return
	}
	id := c.Input().Get("id")
	grade, err := object.GetGrade(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(grade)
}

func (c *ApiController) AddGrade() {
	if !c.RequireSignedIn() {
		return
	}
	var grade object.Grade
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &grade); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	grade.CreatedTime = object.GetCurrentTime()
	affected, err := object.AddGrade(&grade)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) UpdateGrade() {
	if !c.RequireSignedIn() {
		return
	}
	id := c.Input().Get("id")
	var grade object.Grade
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &grade); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	affected, err := object.UpdateGrade(id, &grade)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) DeleteGrade() {
	if !c.RequireSignedIn() {
		return
	}
	var grade object.Grade
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &grade); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	affected, err := object.DeleteGrade(&grade)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}
