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
	"database/sql"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	"github.com/the-open-data/opendata/conf"
	moderncsqlite "modernc.org/sqlite"
	"xorm.io/xorm"
)

func init() {
	sql.Register("sqlite3", &moderncsqlite.Driver{})
}

const defaultMySQLDataSourceName = "root:123456@tcp(localhost:3306)/"

type Adapter struct {
	engine *xorm.Engine
}

var adapter *Adapter

func InitAdapter() {
	driverName := conf.GetConfigString("driverName")
	dataSourceName := conf.GetConfigString("dataSourceName")

	driverName, dataSourceName = resolveDatabase(driverName, dataSourceName)

	var err error
	var engine *xorm.Engine

	if driverName == "sqlite3" {
		engine, err = xorm.NewEngine(driverName, dataSourceName)
	} else {
		dbName := conf.GetConfigString("dbName")
		engine, err = xorm.NewEngine(driverName, dataSourceName+dbName)
	}
	if err != nil {
		panic(err)
	}

	engine.SetMaxOpenConns(20)
	engine.SetMaxIdleConns(5)
	engine.SetConnMaxLifetime(30 * time.Minute)

	adapter = &Adapter{engine: engine}
}

func resolveDatabase(driverName, dataSourceName string) (string, string) {
	dbName := conf.GetConfigString("dbName")

	if driverName != "mysql" || dataSourceName != defaultMySQLDataSourceName {
		fmt.Printf("OpenData: connecting to database [driver=%s, db=%s]\n", driverName, dbName)
		return driverName, dataSourceName
	}

	conn, err := net.DialTimeout("tcp", "localhost:3306", 2*time.Second)
	if err != nil {
		dsn := sqliteDBPath()
		fmt.Printf("OpenData: MySQL not available, using SQLite [path=%s]\n", dsn)
		return "sqlite3", dsn
	}
	conn.Close()
	fmt.Printf("OpenData: connecting to database [driver=%s, db=%s]\n", driverName, dbName)
	return driverName, dataSourceName
}

func sqliteDBPath() string {
	exe, err := os.Executable()
	if err != nil {
		return "opendata.db"
	}
	return filepath.Join(filepath.Dir(exe), "opendata.db")
}

func CreateTables() {
	err := adapter.engine.Sync2(
		new(User),
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
