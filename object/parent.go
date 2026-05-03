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

type Parent struct {
	Owner       string   `xorm:"varchar(100) notnull pk" json:"owner"` // school name
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string   `xorm:"varchar(100)" json:"createdTime"`
	DisplayName string   `xorm:"varchar(200)" json:"displayName"` // real name
	School      string   `xorm:"varchar(100) index" json:"school"`
	Phone       string   `xorm:"varchar(100)" json:"phone"`
	Email       string   `xorm:"varchar(200)" json:"email"`
	Gender      string   `xorm:"varchar(10)" json:"gender"`
	Relation    string   `xorm:"varchar(100)" json:"relation"` // e.g., "父亲", "母亲", "祖父"
	Student     string   `xorm:"varchar(100) index" json:"student"` // linked student name
	Avatar      string   `xorm:"varchar(500)" json:"avatar"`
	Admins      []string `xorm:"mediumtext" json:"admins"`
	Viewers     []string `xorm:"mediumtext" json:"viewers"`
}

func (p *Parent) GetId() string {
	return fmt.Sprintf("%s/%s", p.Owner, p.Name)
}

func GetParents(owner string) ([]*Parent, error) {
	parents := []*Parent{}
	err := adapter.engine.Desc("created_time").Find(&parents, &Parent{Owner: owner})
	return parents, err
}

func GetParentsByStudent(owner, student string) ([]*Parent, error) {
	parents := []*Parent{}
	err := adapter.engine.Desc("created_time").Find(&parents, &Parent{Owner: owner, Student: student})
	return parents, err
}

func GetParentCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Parent{})
}

func GetPaginationParents(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Parent, error) {
	parents := []*Parent{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&parents)
	return parents, err
}

func GetParent(id string) (*Parent, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return nil, err
	}
	return getParent(owner, name)
}

func getParent(owner, name string) (*Parent, error) {
	parent := Parent{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&parent)
	if err != nil {
		return nil, err
	}
	if existed {
		return &parent, nil
	}
	return nil, nil
}

func AddParent(parent *Parent) (bool, error) {
	affected, err := adapter.engine.Insert(parent)
	return affected != 0, err
}

func UpdateParent(id string, parent *Parent) (bool, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return false, err
	}
	_, err = adapter.engine.ID(core.PK{owner, name}).AllCols().Update(parent)
	return err == nil, err
}

func DeleteParent(parent *Parent) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{parent.Owner, parent.Name}).Delete(&Parent{})
	return affected != 0, err
}
