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

type School struct {
	Owner       string   `xorm:"varchar(100) notnull pk" json:"owner"` // always "admin"
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string   `xorm:"varchar(100)" json:"createdTime"`
	DisplayName string   `xorm:"varchar(200)" json:"displayName"`
	Description string   `xorm:"varchar(1000)" json:"description"`
	Address     string   `xorm:"varchar(500)" json:"address"`
	Phone       string   `xorm:"varchar(100)" json:"phone"`
	Logo        string   `xorm:"varchar(500)" json:"logo"`
	Admins      []string `xorm:"mediumtext" json:"admins"`
	Viewers     []string `xorm:"mediumtext" json:"viewers"`
}

func (s *School) GetId() string {
	return fmt.Sprintf("%s/%s", s.Owner, s.Name)
}

func GetGlobalSchools() ([]*School, error) {
	schools := []*School{}
	err := adapter.engine.Asc("owner").Desc("created_time").Find(&schools)
	return schools, err
}

func GetSchools(owner string) ([]*School, error) {
	schools := []*School{}
	err := adapter.engine.Desc("created_time").Find(&schools, &School{Owner: owner})
	return schools, err
}

func GetSchoolCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&School{})
}

func GetPaginationSchools(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*School, error) {
	schools := []*School{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&schools)
	return schools, err
}

func GetSchool(id string) (*School, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return nil, err
	}
	return getSchool(owner, name)
}

func getSchool(owner, name string) (*School, error) {
	school := School{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&school)
	if err != nil {
		return nil, err
	}
	if existed {
		return &school, nil
	}
	return nil, nil
}

func AddSchool(school *School) (bool, error) {
	affected, err := adapter.engine.Insert(school)
	return affected != 0, err
}

func UpdateSchool(id string, school *School) (bool, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return false, err
	}
	_, err = adapter.engine.ID(core.PK{owner, name}).AllCols().Update(school)
	return err == nil, err
}

func DeleteSchool(school *School) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{school.Owner, school.Name}).Delete(&School{})
	return affected != 0, err
}

func GetSchoolNames() ([]string, error) {
	schools, err := GetSchools("admin")
	if err != nil {
		return nil, err
	}
	names := make([]string, 0, len(schools))
	for _, s := range schools {
		names = append(names, s.Name)
	}
	return names, nil
}
