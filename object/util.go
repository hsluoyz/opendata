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

	"github.com/the-open-data/opendata/auth"
)

func GetCurrentTime() string {
	return time.Now().UTC().Format(time.RFC3339)
}

func getOwnerAndNameFromId(id string) (string, string, error) {
	parts := strings.SplitN(id, "/", 2)
	if len(parts) != 2 {
		return "", "", fmt.Errorf("invalid id: %s", id)
	}
	return parts[0], parts[1], nil
}

func IsAdmin(user *auth.User) bool {
	if user == nil {
		return false
	}
	return user.IsAdmin
}

func IsSchoolAdmin(user *auth.User, schoolName string) bool {
	if user == nil {
		return false
	}
	if IsAdmin(user) {
		return true
	}
	role := ""
	school := ""
	if user.Properties != nil {
		role = user.Properties["role"]
		school = user.Properties["schoolName"]
	}
	return role == "school_admin" && school == schoolName
}

func HasViewPermission(user *auth.User, admins []string, viewers []string) bool {
	if user == nil {
		return false
	}
	if IsAdmin(user) {
		return true
	}
	for _, a := range admins {
		if a == user.Name {
			return true
		}
	}
	for _, v := range viewers {
		if v == user.Name {
			return true
		}
	}
	return false
}

func HasAdminPermission(user *auth.User, admins []string) bool {
	if user == nil {
		return false
	}
	if IsAdmin(user) {
		return true
	}
	for _, a := range admins {
		if a == user.Name {
			return true
		}
	}
	return false
}
