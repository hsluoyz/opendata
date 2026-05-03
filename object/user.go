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

	"golang.org/x/crypto/bcrypt"
	"xorm.io/core"
)

type User struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	DisplayName string `xorm:"varchar(200)" json:"displayName"`
	Password    string `xorm:"varchar(200)" json:"password"`
	IsAdmin     bool   `json:"isAdmin"`
	Role        string `xorm:"varchar(100) index" json:"role"` // admin, school_admin, teacher, student, parent
	SchoolName  string `xorm:"varchar(100) index" json:"schoolName"`
	LinkedId    string `xorm:"varchar(100) index" json:"linkedId"` // links to teacher/student/parent object name
	Avatar      string `xorm:"varchar(500)" json:"avatar"`
}

func (u *User) GetId() string {
	return fmt.Sprintf("%s/%s", u.Owner, u.Name)
}

func CheckPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func GetUser(id string) (*User, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return nil, err
	}
	return getUser(owner, name)
}

func getUser(owner, name string) (*User, error) {
	user := User{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&user)
	if err != nil {
		return nil, err
	}
	if existed {
		return &user, nil
	}
	return nil, nil
}

func GetUserByName(name string) (*User, error) {
	user := &User{}
	existed, err := adapter.engine.Where("name=?", name).Get(user)
	if err != nil {
		return nil, err
	}
	if existed {
		return user, nil
	}
	return nil, nil
}

func GetUsers(owner string) ([]*User, error) {
	users := []*User{}
	err := adapter.engine.Desc("created_time").Find(&users, &User{Owner: owner})
	if err != nil {
		return nil, err
	}
	return users, nil
}

func GetGlobalUsers() ([]*User, error) {
	users := []*User{}
	err := adapter.engine.Desc("created_time").Find(&users)
	if err != nil {
		return nil, err
	}
	return users, nil
}

func GetUserCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&User{})
}

func GetPaginationUsers(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*User, error) {
	users := []*User{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&users)
	return users, err
}

func AddUser(user *User) (bool, error) {
	if user.Password != "" {
		hashed, err := HashPassword(user.Password)
		if err != nil {
			return false, err
		}
		user.Password = hashed
	}
	affected, err := adapter.engine.Insert(user)
	return affected != 0, err
}

func UpdateUser(id string, user *User) (bool, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return false, err
	}
	old, err := getUser(owner, name)
	if err != nil {
		return false, err
	}
	if old == nil {
		return false, nil
	}
	if user.Password != "" && user.Password != old.Password {
		hashed, err := HashPassword(user.Password)
		if err != nil {
			return false, err
		}
		user.Password = hashed
	} else {
		user.Password = old.Password
	}
	affected, err := adapter.engine.ID(core.PK{owner, name}).AllCols().Update(user)
	return affected != 0, err
}

func DeleteUser(user *User) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{user.Owner, user.Name}).Delete(&User{})
	return affected != 0, err
}

func InitDb() {
	admin, err := getUser("admin", "admin")
	if err != nil {
		panic(err)
	}
	if admin == nil {
		hashed, err := HashPassword("123456")
		if err != nil {
			panic(err)
		}
		admin = &User{
			Owner:       "admin",
			Name:        "admin",
			CreatedTime: GetCurrentTime(),
			DisplayName: "管理员",
			Password:    hashed,
			IsAdmin:     true,
			Role:        "admin",
		}
		_, err = adapter.engine.Insert(admin)
		if err != nil {
			panic(err)
		}
	}
}
