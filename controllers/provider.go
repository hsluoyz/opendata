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

func (c *ApiController) GetProviders() {
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
		providers, err := object.GetProviders(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(providers)
		return
	}

	limitInt := parseInt(limit)
	count, err := object.GetProviderCount(owner, field, value)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	paginator := pagination.SetPaginator(c.Ctx, limitInt, count)
	providers, err := object.GetPaginationProviders(owner, paginator.Offset(), limitInt, field, value, sortField, sortOrder)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(providers, paginator.Nums())
}

func (c *ApiController) GetProvider() {
	if !c.RequireAdmin() {
		return
	}
	id := c.Input().Get("id")
	provider, err := object.GetProvider(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	if provider != nil && provider.Category != "Storage" {
		c.ResponseError("仅支持存储（Storage）类型的提供商")
		return
	}
	c.ResponseOk(provider)
}

func (c *ApiController) AddProvider() {
	if !c.RequireAdmin() {
		return
	}
	var provider object.Provider
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &provider); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	provider.Owner = "admin"
	provider.Category = "Storage"
	provider.CreatedTime = object.GetCurrentTime()
	affected, err := object.AddProvider(&provider)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) UpdateProvider() {
	if !c.RequireAdmin() {
		return
	}
	id := c.Input().Get("id")
	var provider object.Provider
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &provider); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	provider.Owner = "admin"
	provider.Category = "Storage"
	affected, err := object.UpdateProvider(id, &provider)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) DeleteProvider() {
	if !c.RequireAdmin() {
		return
	}
	var provider object.Provider
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &provider); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	affected, err := object.DeleteProvider(&provider)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}
