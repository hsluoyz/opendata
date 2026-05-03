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

type Student struct {
	Owner       string   `xorm:"varchar(100) notnull pk" json:"owner"` // school name
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string   `xorm:"varchar(100)" json:"createdTime"`
	DisplayName string   `xorm:"varchar(200)" json:"displayName"` // real name
	School      string   `xorm:"varchar(100) index" json:"school"`
	Grade       string   `xorm:"varchar(100) index" json:"grade"`
	Class       string   `xorm:"varchar(100) index" json:"class"`
	StudentId   string   `xorm:"varchar(100) index" json:"studentId"` // student number
	Gender      string   `xorm:"varchar(10)" json:"gender"`
	BirthDate   string   `xorm:"varchar(100)" json:"birthDate"`
	Address     string   `xorm:"varchar(500)" json:"address"`
	Phone       string   `xorm:"varchar(100)" json:"phone"`
	Avatar      string   `xorm:"varchar(500)" json:"avatar"`
	Parents     []string `xorm:"mediumtext" json:"parents"` // JSON array of parent names
	Admins      []string `xorm:"mediumtext" json:"admins"`
	Viewers     []string `xorm:"mediumtext" json:"viewers"`
}

func (s *Student) GetId() string {
	return fmt.Sprintf("%s/%s", s.Owner, s.Name)
}

func GetStudents(owner string) ([]*Student, error) {
	students := []*Student{}
	err := adapter.engine.Desc("created_time").Find(&students, &Student{Owner: owner})
	return students, err
}

func GetStudentsByClass(owner, class string) ([]*Student, error) {
	students := []*Student{}
	err := adapter.engine.Desc("created_time").Find(&students, &Student{Owner: owner, Class: class})
	return students, err
}

func GetStudentCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Student{})
}

func GetPaginationStudents(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Student, error) {
	students := []*Student{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&students)
	return students, err
}

func GetStudent(id string) (*Student, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return nil, err
	}
	return getStudent(owner, name)
}

func getStudent(owner, name string) (*Student, error) {
	student := Student{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&student)
	if err != nil {
		return nil, err
	}
	if existed {
		return &student, nil
	}
	return nil, nil
}

func AddStudent(student *Student) (bool, error) {
	affected, err := adapter.engine.Insert(student)
	return affected != 0, err
}

func UpdateStudent(id string, student *Student) (bool, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return false, err
	}
	_, err = adapter.engine.ID(core.PK{owner, name}).AllCols().Update(student)
	return err == nil, err
}

func DeleteStudent(student *Student) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{student.Owner, student.Name}).Delete(&Student{})
	return affected != 0, err
}
