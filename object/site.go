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

	"github.com/the-open-data/opendata/util"
	"xorm.io/core"
)

type Site struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`

	ThemeColor string   `xorm:"varchar(100)" json:"themeColor"`
	HtmlTitle  string   `xorm:"varchar(100)" json:"htmlTitle"`
	FaviconUrl string   `xorm:"varchar(200)" json:"faviconUrl"`
	LogoUrl    string   `xorm:"varchar(200)" json:"logoUrl"`
	FooterHtml string   `xorm:"mediumtext" json:"footerHtml"`
	NavItems   []string `xorm:"text" json:"navItems"`

	StorageProvider string `xorm:"varchar(100)" json:"storageProvider"`
	StoragePath     string `xorm:"varchar(500)" json:"storagePath"`
}

func (s *Site) GetId() string {
	return fmt.Sprintf("%s/%s", s.Owner, s.Name)
}

func GetGlobalSites() ([]*Site, error) {
	sites := []*Site{}
	err := adapter.engine.Asc("owner").Desc("created_time").Find(&sites)
	return sites, err
}

func GetSites(owner string) ([]*Site, error) {
	sites := []*Site{}
	err := adapter.engine.Desc("created_time").Where("owner = ?", owner).Find(&sites)
	return sites, err
}

func GetSite(id string) (*Site, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return nil, err
	}
	site := &Site{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(site)
	if err != nil {
		return nil, err
	}
	if !existed {
		return nil, nil
	}
	return site, nil
}

func GetBuiltInSite() (*Site, error) {
	return GetSite("admin/site-built-in")
}

func UpdateSite(id string, site *Site) (bool, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return false, err
	}
	if s, err := GetSite(id); err != nil {
		return false, err
	} else if s == nil {
		return false, nil
	}
	affected, err := adapter.engine.ID(core.PK{owner, name}).AllCols().Update(site)
	if err != nil {
		return false, err
	}
	return affected != 0 || site != nil, nil
}

func AddSite(site *Site) (bool, error) {
	affected, err := adapter.engine.Insert(site)
	return affected != 0, err
}

func DeleteSite(site *Site) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{site.Owner, site.Name}).Delete(&Site{})
	return affected != 0, err
}

func InitBuiltInSite() {
	site, err := GetBuiltInSite()
	if err != nil {
		panic(err)
	}
	if site != nil {
		return
	}

	site = &Site{
		Owner:           "admin",
		Name:            "site-built-in",
		CreatedTime:     util.GetCurrentTime(),
		DisplayName:     "默认站点",
		ThemeColor:      "#404040",
		HtmlTitle:       "OpenData",
		FaviconUrl:      "",
		LogoUrl:         "",
		FooterHtml:      "Powered by OpenData",
		StorageProvider: "local",
		StoragePath:     "./files",
		NavItems: []string{
			"/schools", "/grades", "/classes", "/subjects",
			"/teachers", "/students", "/parents",
			"/files", "/providers",
			"/records", "/sessions",
			"/sites", "/visitors", "/sysinfo", "/swagger",
		},
	}

	_, err = AddSite(site)
	if err != nil {
		panic(fmt.Errorf("failed to initialize built-in site: %w", err))
	}
}
