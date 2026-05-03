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

package util

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

func GetCurrentTime() string {
	return time.Now().UTC().Format(time.RFC3339)
}

func GetIdFromOwnerAndName(owner, name string) string {
	return fmt.Sprintf("%s/%s", owner, name)
}

func GetOwnerAndNameFromId(id string) (string, string) {
	parts := strings.SplitN(id, "/", 2)
	if len(parts) != 2 {
		return "", id
	}
	return parts[0], parts[1]
}

func GetOwnerAndNameFromIdWithError(id string) (string, string, error) {
	parts := strings.SplitN(id, "/", 2)
	if len(parts) != 2 {
		return "", "", fmt.Errorf("invalid id: %s", id)
	}
	return parts[0], parts[1], nil
}

func ParseInt(s string) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return i
}

func SnakeString(s string) string {
	data := make([]byte, 0, len(s)*2)
	j := false
	num := len(s)
	for i := 0; i < num; i++ {
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

func FilterField(field string) bool {
	allowedFields := []string{
		"name", "displayName", "owner", "school", "grade", "class",
		"subject", "teacher", "student", "parent", "type", "category",
		"tag", "uploader", "role", "title", "phone", "email",
	}
	for _, f := range allowedFields {
		if field == f {
			return true
		}
	}
	return false
}

func EnsureFolderExists(path string) {
	// no-op for now, caller should handle
}
