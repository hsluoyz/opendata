// Copyright 2024 The OpenData Authors. All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
// Copied from Casdoor util/path.go (UrlJoin, GetUrlPath, GetUrlHost) for storage URL building.

package util

import (
	"fmt"
	"net/url"
	"strings"
)

func UrlJoin(base string, path string) string {
	return fmt.Sprintf("%s/%s", strings.TrimRight(base, "/"), strings.TrimLeft(path, "/"))
}

func GetUrlPath(urlString string) string {
	u, _ := url.Parse(urlString)
	if u == nil {
		return ""
	}
	return u.Path
}

func GetUrlHost(urlString string) string {
	if urlString == "" {
		return ""
	}
	u, err := url.Parse(urlString)
	if err != nil {
		return ""
	}
	return fmt.Sprintf("%s://%s", u.Scheme, u.Host)
}
