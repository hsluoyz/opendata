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
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/beego/beego/context"
	"github.com/google/uuid"
	"github.com/the-open-data/opendata/conf"
)

func GetCurrentTime() string {
	return time.Now().UTC().Format(time.RFC3339)
}

// GetCurrentUnixTime returns the current time as Unix nanoseconds in decimal (Casdoor-compatible).
// Suitable for embedding in cross-platform file paths (no reserved characters on Windows).
func GetCurrentUnixTime() string {
	return strconv.FormatInt(time.Now().UnixNano(), 10)
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

func ParseIntWithError(s string) (int, error) {
	i, err := strconv.Atoi(s)
	if err != nil {
		return -1, err
	}
	if i < 0 {
		return -1, errors.New("negative number")
	}
	return i, nil
}

func GenerateId() string {
	return uuid.NewString()
}

func GetCurrentTimeWithMilli() string {
	return time.Now().Format("2006-01-02T15:04:05.999Z07:00")
}

func GetCurrentTimeBasedOnLastMilli(timestamp string) string {
	tm := time.Now()
	inputTime, err := time.Parse("2006-01-02T15:04:05.999Z07:00", timestamp)
	if err != nil {
		return tm.Format("2006-01-02T15:04:05.999Z07:00")
	}
	if !tm.After(inputTime.Add(1 * time.Millisecond)) {
		tm = inputTime.Add(1 * time.Millisecond)
	}
	return tm.Format("2006-01-02T15:04:05.999Z07:00")
}

func DeleteVal(strs []string, str string) []string {
	result := []string{}
	for _, s := range strs {
		if s != str {
			result = append(result, s)
		}
	}
	return result
}

func GetRandomName() string {
	const charset = "0123456789abcdefghijklmnopqrstuvwxyz"
	result := make([]byte, 6)
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))]
	}
	return string(result)
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

func GetIPFromRequest(r *http.Request) string {
	headers := []string{"X-Forwarded-For", "X-Real-IP", "CF-Connecting-IP"}
	for _, header := range headers {
		value := strings.TrimSpace(r.Header.Get(header))
		if value == "" {
			continue
		}
		return strings.TrimSpace(strings.Split(value, ",")[0])
	}

	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

func FilterQuery(requestUri string, filterKeys []string) string {
	u, err := url.ParseRequestURI(requestUri)
	if err != nil {
		return requestUri
	}

	query := u.Query()
	for _, key := range filterKeys {
		query.Del(key)
	}
	u.RawQuery = query.Encode()
	return u.String()
}

func EnsureFolderExists(path string) {}

// AppendWebConfigCookie sets the jsonWebConfig cookie with URL-encoded JSON of the web config.
func AppendWebConfigCookie(ctx *context.Context) error {
	webConfig := conf.GetWebConfig()
	jsonBytes, err := json.Marshal(webConfig)
	if err != nil {
		return err
	}
	encoded := url.QueryEscape(string(jsonBytes))
	ctx.SetCookie("jsonWebConfig", encoded)
	return nil
}
