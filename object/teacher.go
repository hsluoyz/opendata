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

type Teacher struct {
	Owner       string   `xorm:"varchar(100) notnull pk" json:"owner"` // school name
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string   `xorm:"varchar(100)" json:"createdTime"`
	DisplayName string   `xorm:"varchar(200)" json:"displayName"` // real name
	School      string   `xorm:"varchar(100) index" json:"school"`
	Title       string   `xorm:"varchar(100)" json:"title"` // e.g., "校长", "班主任", "任课老师"
	Phone       string   `xorm:"varchar(100)" json:"phone"`
	Email       string   `xorm:"varchar(200)" json:"email"`
	Gender      string   `xorm:"varchar(10)" json:"gender"`
	Avatar      string   `xorm:"varchar(500)" json:"avatar"`
	Subjects    []string `xorm:"mediumtext" json:"subjects"` // JSON array of subject IDs (owner/name)
	Admins      []string `xorm:"mediumtext" json:"admins"`
	Viewers     []string `xorm:"mediumtext" json:"viewers"`
}

func (t *Teacher) GetId() string {
	return fmt.Sprintf("%s/%s", t.Owner, t.Name)
}

func GetTeachers(owner string) ([]*Teacher, error) {
	teachers := []*Teacher{}
	err := adapter.engine.Desc("created_time").Find(&teachers, &Teacher{Owner: owner})
	return teachers, err
}

func GetTeacherCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Teacher{})
}

func GetPaginationTeachers(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Teacher, error) {
	teachers := []*Teacher{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&teachers)
	return teachers, err
}

func GetTeacher(id string) (*Teacher, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return nil, err
	}
	return getTeacher(owner, name)
}

func getTeacher(owner, name string) (*Teacher, error) {
	teacher := Teacher{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&teacher)
	if err != nil {
		return nil, err
	}
	if existed {
		return &teacher, nil
	}
	return nil, nil
}

func AddTeacher(teacher *Teacher) (bool, error) {
	affected, err := adapter.engine.Insert(teacher)
	return affected != 0, err
}

func UpdateTeacher(id string, teacher *Teacher) (bool, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return false, err
	}
	_, err = adapter.engine.ID(core.PK{owner, name}).AllCols().Update(teacher)
	return err == nil, err
}

func DeleteTeacher(teacher *Teacher) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{teacher.Owner, teacher.Name}).Delete(&Teacher{})
	return affected != 0, err
}
