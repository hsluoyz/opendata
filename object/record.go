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

package object

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/beego/beego/context"
	"github.com/the-open-data/opendata/util"
)

type Record struct {
	Id int `xorm:"int notnull pk autoincr" json:"id"`

	Owner       string `xorm:"varchar(100) index" json:"owner"`
	Name        string `xorm:"varchar(100) index" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	Organization string `xorm:"varchar(100)" json:"organization"`
	ClientIp     string `xorm:"varchar(100)" json:"clientIp"`
	UserAgent    string `xorm:"varchar(200)" json:"userAgent"`
	User         string `xorm:"varchar(100)" json:"user"`
	Method       string `xorm:"varchar(100)" json:"method"`
	RequestUri   string `xorm:"varchar(1000)" json:"requestUri"`
	Action       string `xorm:"varchar(1000)" json:"action"`
	Language     string `xorm:"varchar(100)" json:"language"`
	Query        string `xorm:"varchar(100)" json:"query"`
	Region       string `xorm:"varchar(100)" json:"region"`
	City         string `xorm:"varchar(100)" json:"city"`
	Unit         string `xorm:"varchar(100)" json:"unit"`
	Section      string `xorm:"varchar(100)" json:"section"`

	Object    string `xorm:"mediumtext" json:"object"`
	Response  string `xorm:"mediumtext" json:"response"`
	ErrorText string `xorm:"mediumtext" json:"errorText"`

	Count       int  `xorm:"int" json:"count"`
	IsTriggered bool `json:"isTriggered"`
}

type recordResponse struct {
	Status string `json:"status"`
	Msg    string `json:"msg"`
}

func GetRecordCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Record{Owner: owner})
}

func GetRecords(owner string) ([]*Record, error) {
	records := []*Record{}
	err := adapter.engine.Desc("id").Find(&records, &Record{Owner: owner})
	return records, err
}

func getAllRecords() ([]*Record, error) {
	records := []*Record{}
	err := adapter.engine.Desc("id").Find(&records, &Record{})
	return records, err
}

func GetPaginationRecords(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Record, error) {
	records := []*Record{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&records)
	return records, err
}

func GetRecord(id string) (*Record, error) {
	record := &Record{}
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return nil, err
	}
	if recordId, err := util.ParseIntWithError(name); err == nil && recordId > 0 {
		record.Id = recordId
	} else {
		record.Owner = owner
		record.Name = name
	}
	existed, err := adapter.engine.Get(record)
	if err != nil {
		return nil, err
	}
	if existed {
		return record, nil
	}
	return nil, nil
}

func UpdateRecord(id string, record *Record) (bool, error) {
	p, err := GetRecord(id)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}
	affected, err := adapter.engine.Where("id = ?", p.Id).AllCols().Update(record)
	return affected != 0, err
}

func AddRecord(record *Record) (bool, error) {
	record.Id = 0
	record.Name = util.GenerateId()
	record.Owner = record.Organization
	record.CreatedTime = util.GetCurrentTimeWithMilli()
	if record.Count == 0 {
		record.Count = 1
	}
	affected, err := adapter.engine.Insert(record)
	return affected != 0, err
}

func AddRecords(records []*Record) (bool, error) {
	if len(records) == 0 {
		return false, nil
	}
	recordTime := util.GetCurrentTimeWithMilli()
	for _, r := range records {
		r.Id = 0
		r.Name = util.GenerateId()
		r.Owner = r.Organization
		r.CreatedTime = util.GetCurrentTimeBasedOnLastMilli(recordTime)
		recordTime = r.CreatedTime
		if r.Count == 0 {
			r.Count = 1
		}
	}

	session := adapter.engine.NewSession()
	defer session.Close()
	if err := session.Begin(); err != nil {
		return false, err
	}

	batchSize := 150
	totalAffected := int64(0)
	for i := 0; i < len(records); i += batchSize {
		end := i + batchSize
		if end > len(records) {
			end = len(records)
		}
		affected, err := session.Insert(records[i:end])
		if err != nil {
			session.Rollback()
			return false, err
		}
		totalAffected += affected
	}

	if err := session.Commit(); err != nil {
		return false, err
	}
	return totalAffected != 0, nil
}

func DeleteRecord(record *Record) (bool, error) {
	affected, err := adapter.engine.Where("id = ?", record.Id).Delete(&Record{})
	return affected != 0, err
}

func NewRecord(ctx *context.Context) (*Record, error) {
	ip := strings.Replace(util.GetIPFromRequest(ctx.Request), ": ", "", -1)
	action := strings.Replace(ctx.Request.URL.Path, "/api/", "", 1)
	requestUri := util.FilterQuery(ctx.Request.RequestURI, []string{"accessToken"})
	if len(requestUri) > 1000 {
		requestUri = requestUri[0:1000]
	}

	objectText := ""
	if len(ctx.Input.RequestBody) != 0 {
		objectText = string(ctx.Input.RequestBody)
	}

	respBytes, err := json.Marshal(ctx.Input.Data()["json"])
	if err != nil {
		return nil, err
	}

	var resp recordResponse
	if err = json.Unmarshal(respBytes, &resp); err != nil {
		return nil, err
	}

	language := ctx.Request.Header.Get("Accept-Language")
	if len(language) > 2 {
		language = language[0:2]
	}

	record := Record{
		Name:        util.GenerateId(),
		CreatedTime: util.GetCurrentTimeWithMilli(),
		ClientIp:    ip,
		UserAgent:   ctx.Request.UserAgent(),
		Method:      ctx.Request.Method,
		RequestUri:  requestUri,
		Action:      action,
		Language:    language,
		Object:      objectText,
		Response:    fmt.Sprintf("{\"status\":\"%s\",\"msg\":\"%s\"}", resp.Status, resp.Msg),
		Count:       1,
		IsTriggered: false,
	}
	return &record, nil
}

func (record *Record) getId() string {
	return fmt.Sprintf("%s/%s", record.Owner, record.Name)
}
