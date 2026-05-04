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
	"strings"

	"github.com/beego/beego/context"
	"github.com/beego/beego/logs"
	"github.com/the-open-data/opendata/object"
	"github.com/the-open-data/opendata/util"
)

func RecordMessage(ctx *context.Context) {
	if !strings.HasPrefix(ctx.Request.URL.Path, "/api/") {
		return
	}
	if ctx.Request.URL.Path == "/api/get-records" || ctx.Request.URL.Path == "/api/get-record" {
		return
	}

	user := GetSessionUser(ctx)
	if user != nil {
		ctx.Input.SetParam("recordUserId", util.GetIdFromOwnerAndName(user.Owner, user.Name))
	}
}

func AfterRecordMessage(ctx *context.Context) {
	if !strings.HasPrefix(ctx.Request.URL.Path, "/api/") {
		return
	}
	if ctx.Request.URL.Path == "/api/get-records" || ctx.Request.URL.Path == "/api/get-record" {
		return
	}

	record, err := object.NewRecord(ctx)
	if err != nil {
		logs.Error("AfterRecordMessage() error: %s", err.Error())
		return
	}

	userId := ctx.Input.Params()["recordUserId"]
	if userId != "" {
		organization, user, err := util.GetOwnerAndNameFromIdWithError(userId)
		if err != nil {
			logs.Error("AfterRecordMessage() invalid user id: %s", err.Error())
			return
		}
		record.Organization, record.User = organization, user
	}

	_, err = object.AddRecord(record)
	if err != nil {
		logs.Error("AfterRecordMessage() add record error: %s", err.Error())
	}
}
