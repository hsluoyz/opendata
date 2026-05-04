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
	"fmt"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/the-open-data/opendata/conf"
	"xorm.io/xorm"
)

type Adapter struct {
	engine *xorm.Engine
}

var adapter *Adapter

func InitAdapter() {
	driverName := conf.GetConfigString("driverName")
	dataSourceName := conf.GetConfigString("dataSourceName")
	dbName := conf.GetConfigString("dbName")

	fmt.Printf("OpenData: connecting to database [driver=%s, db=%s]\n", driverName, dbName)

	engine, err := xorm.NewEngine(driverName, dataSourceName+dbName)
	if err != nil {
		panic(err)
	}

	engine.SetMaxOpenConns(20)
	engine.SetMaxIdleConns(5)
	engine.SetConnMaxLifetime(30 * time.Minute)

	adapter = &Adapter{engine: engine}
}

func CreateTables() {
	err := adapter.engine.Sync2(
		new(School),
		new(Grade),
		new(Class),
		new(Subject),
		new(Teacher),
		new(Student),
		new(Parent),
		new(File),
		new(Provider),
	)
	if err != nil {
		panic(err)
	}
}

func GetDbSession(owner string, offset, limit int, field, value, sortField, sortOrder string) *xorm.Session {
	session := adapter.engine.NewSession()
	if owner != "" {
		session = session.And("owner=?", owner)
	}
	if field != "" && value != "" {
		session = session.And(fmt.Sprintf("%s like ?", SnakeString(field)), fmt.Sprintf("%%%s%%", value))
	}
	if sortField == "" || sortField == "createdTime" {
		sortField = "created_time"
	} else {
		sortField = SnakeString(sortField)
	}
	if sortOrder == "ascend" {
		session = session.Asc(sortField)
	} else {
		session = session.Desc(sortField)
	}
	if offset != -1 && limit != -1 {
		session = session.Limit(limit, offset)
	}
	return session
}

func SnakeString(s string) string {
	data := make([]byte, 0, len(s)*2)
	j := false
	for i := 0; i < len(s); i++ {
		d := s[i]
		if i > 0 && d >= 'A' && d <= 'Z' && j {
			data = append(data, '_')
		}
		if d != '_' {
			j = true
		}
		data = append(data, d)
	}
	return strings.ToLower(string(data))
}
