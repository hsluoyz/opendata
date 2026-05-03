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

type Subject struct {
	Owner       string   `xorm:"varchar(100) notnull pk" json:"owner"` // school name
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string   `xorm:"varchar(100)" json:"createdTime"`
	DisplayName string   `xorm:"varchar(200)" json:"displayName"` // e.g., "数学"
	School      string   `xorm:"varchar(100) index" json:"school"`
	Grade       string   `xorm:"varchar(100) index" json:"grade"`
	Class       string   `xorm:"varchar(100) index" json:"class"`
	Teacher     string   `xorm:"varchar(100) index" json:"teacher"`
	Admins      []string `xorm:"mediumtext" json:"admins"`
	Viewers     []string `xorm:"mediumtext" json:"viewers"`
}

func (s *Subject) GetId() string {
	return fmt.Sprintf("%s/%s", s.Owner, s.Name)
}

func GetSubjects(owner string) ([]*Subject, error) {
	subjects := []*Subject{}
	err := adapter.engine.Desc("created_time").Find(&subjects, &Subject{Owner: owner})
	return subjects, err
}

func GetSubjectsByClass(owner, class string) ([]*Subject, error) {
	subjects := []*Subject{}
	err := adapter.engine.Desc("created_time").Find(&subjects, &Subject{Owner: owner, Class: class})
	return subjects, err
}

func GetSubjectCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Subject{})
}

func GetPaginationSubjects(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Subject, error) {
	subjects := []*Subject{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&subjects)
	return subjects, err
}

func GetSubject(id string) (*Subject, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return nil, err
	}
	return getSubject(owner, name)
}

func getSubject(owner, name string) (*Subject, error) {
	subject := Subject{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&subject)
	if err != nil {
		return nil, err
	}
	if existed {
		return &subject, nil
	}
	return nil, nil
}

func AddSubject(subject *Subject) (bool, error) {
	affected, err := adapter.engine.Insert(subject)
	return affected != 0, err
}

func UpdateSubject(id string, subject *Subject) (bool, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return false, err
	}
	_, err = adapter.engine.ID(core.PK{owner, name}).AllCols().Update(subject)
	return err == nil, err
}

func DeleteSubject(subject *Subject) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{subject.Owner, subject.Name}).Delete(&Subject{})
	return affected != 0, err
}
