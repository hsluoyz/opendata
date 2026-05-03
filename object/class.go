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

type Class struct {
	Owner       string   `xorm:"varchar(100) notnull pk" json:"owner"` // school name
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string   `xorm:"varchar(100)" json:"createdTime"`
	DisplayName string   `xorm:"varchar(200)" json:"displayName"` // e.g., "一年级一班"
	School      string   `xorm:"varchar(100) index" json:"school"`
	Grade       string   `xorm:"varchar(100) index" json:"grade"`
	Admins      []string `xorm:"mediumtext" json:"admins"`
	Viewers     []string `xorm:"mediumtext" json:"viewers"`
}

func (c *Class) GetId() string {
	return fmt.Sprintf("%s/%s", c.Owner, c.Name)
}

func GetClasses(owner string) ([]*Class, error) {
	classes := []*Class{}
	err := adapter.engine.Desc("created_time").Find(&classes, &Class{Owner: owner})
	return classes, err
}

func GetClassesByGrade(owner, grade string) ([]*Class, error) {
	classes := []*Class{}
	err := adapter.engine.Desc("created_time").Find(&classes, &Class{Owner: owner, Grade: grade})
	return classes, err
}

func GetClassCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Class{})
}

func GetPaginationClasses(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Class, error) {
	classes := []*Class{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&classes)
	return classes, err
}

func GetClass(id string) (*Class, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return nil, err
	}
	return getClass(owner, name)
}

func getClass(owner, name string) (*Class, error) {
	class := Class{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&class)
	if err != nil {
		return nil, err
	}
	if existed {
		return &class, nil
	}
	return nil, nil
}

func AddClass(class *Class) (bool, error) {
	affected, err := adapter.engine.Insert(class)
	return affected != 0, err
}

func UpdateClass(id string, class *Class) (bool, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return false, err
	}
	_, err = adapter.engine.ID(core.PK{owner, name}).AllCols().Update(class)
	return err == nil, err
}

func DeleteClass(class *Class) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{class.Owner, class.Name}).Delete(&Class{})
	return affected != 0, err
}
