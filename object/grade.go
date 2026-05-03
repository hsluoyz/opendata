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

	"xorm.io/core"
)

type Grade struct {
	Owner       string   `xorm:"varchar(100) notnull pk" json:"owner"` // school name
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string   `xorm:"varchar(100)" json:"createdTime"`
	DisplayName string   `xorm:"varchar(200)" json:"displayName"` // e.g., "一年级"
	School      string   `xorm:"varchar(100) index" json:"school"`
	Year        int      `xorm:"int index" json:"year"` // enrollment year
	Admins      []string `xorm:"mediumtext" json:"admins"`
	Viewers     []string `xorm:"mediumtext" json:"viewers"`
}

func (g *Grade) GetId() string {
	return fmt.Sprintf("%s/%s", g.Owner, g.Name)
}

func GetGrades(owner string) ([]*Grade, error) {
	grades := []*Grade{}
	err := adapter.engine.Desc("created_time").Find(&grades, &Grade{Owner: owner})
	return grades, err
}

func GetGradesBySchool(school string) ([]*Grade, error) {
	grades := []*Grade{}
	err := adapter.engine.Desc("created_time").Find(&grades, &Grade{School: school})
	return grades, err
}

func GetGradeCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Grade{})
}

func GetPaginationGrades(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Grade, error) {
	grades := []*Grade{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&grades)
	return grades, err
}

func GetGrade(id string) (*Grade, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return nil, err
	}
	return getGrade(owner, name)
}

func getGrade(owner, name string) (*Grade, error) {
	grade := Grade{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&grade)
	if err != nil {
		return nil, err
	}
	if existed {
		return &grade, nil
	}
	return nil, nil
}

func AddGrade(grade *Grade) (bool, error) {
	affected, err := adapter.engine.Insert(grade)
	return affected != 0, err
}

func UpdateGrade(id string, grade *Grade) (bool, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return false, err
	}
	_, err = adapter.engine.ID(core.PK{owner, name}).AllCols().Update(grade)
	return err == nil, err
}

func DeleteGrade(grade *Grade) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{grade.Owner, grade.Name}).Delete(&Grade{})
	return affected != 0, err
}
