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

	"github.com/the-open-data/opendata/storage"
	"xorm.io/core"
)

type Provider struct {
	Owner        string `xorm:"varchar(100) notnull pk" json:"owner"` // always "admin"
	Name         string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime  string `xorm:"varchar(100)" json:"createdTime"`
	DisplayName  string `xorm:"varchar(200)" json:"displayName"`
	DisplayName2 string `xorm:"varchar(200)" json:"displayName2"`
	Category     string `xorm:"varchar(100)" json:"category"` // "Storage"
	Type         string `xorm:"varchar(100)" json:"type"`     // "Local File System"
	SubType      string `xorm:"varchar(100)" json:"subType"`
	ClientId     string `xorm:"varchar(500)" json:"clientId"` // local path or bucket
	ClientSecret string `xorm:"varchar(500)" json:"clientSecret"`
	Region       string `xorm:"varchar(100)" json:"region"`
	ProviderUrl  string `xorm:"varchar(500)" json:"providerUrl"`
	State        string `xorm:"varchar(100)" json:"state"`
	IsDefault    bool   `json:"isDefault"`
	IsRemote     bool   `json:"isRemote"`
}

func (p *Provider) GetId() string {
	return fmt.Sprintf("%s/%s", p.Owner, p.Name)
}

func GetProviders(owner string) ([]*Provider, error) {
	providers := []*Provider{}
	err := adapter.engine.Desc("created_time").Find(&providers, &Provider{Owner: owner, Category: "Storage"})
	return providers, err
}

func GetStorageProviders() ([]*Provider, error) {
	providers := []*Provider{}
	err := adapter.engine.Desc("created_time").Find(&providers, &Provider{Category: "Storage"})
	return providers, err
}

func GetProviderCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	session = session.And("category=?", "Storage")
	return session.Count(&Provider{})
}

func GetPaginationProviders(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Provider, error) {
	providers := []*Provider{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	session = session.And("category=?", "Storage")
	err := session.Find(&providers)
	return providers, err
}

func GetProvider(id string) (*Provider, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return nil, err
	}
	return getProvider(owner, name)
}

func getProvider(owner, name string) (*Provider, error) {
	provider := Provider{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&provider)
	if err != nil {
		return nil, err
	}
	if existed {
		return &provider, nil
	}
	return nil, nil
}

func GetDefaultStorageProvider() (*Provider, error) {
	provider := &Provider{}
	existed, err := adapter.engine.Where("category=? AND is_default=?", "Storage", true).Get(provider)
	if err != nil {
		return nil, err
	}
	if existed {
		return provider, nil
	}
	// fallback: get first storage provider
	existed, err = adapter.engine.Where("category=?", "Storage").Get(provider)
	if err != nil {
		return nil, err
	}
	if existed {
		return provider, nil
	}
	return nil, nil
}

func AddProvider(provider *Provider) (bool, error) {
	provider.Category = "Storage"
	affected, err := adapter.engine.Insert(provider)
	return affected != 0, err
}

func UpdateProvider(id string, provider *Provider) (bool, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return false, err
	}
	provider.Category = "Storage"
	_, err = adapter.engine.ID(core.PK{owner, name}).AllCols().Update(provider)
	return err == nil, err
}

func DeleteProvider(provider *Provider) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{provider.Owner, provider.Name}).Delete(&Provider{})
	return affected != 0, err
}

func (p *Provider) GetStorageProviderObj() (storage.StorageProvider, error) {
	return storage.GetStorageProvider(p.Type, p.ClientId, p.ClientSecret, p.Name)
}

func InitDefaultProvider() {
	provider, err := GetDefaultStorageProvider()
	if err != nil {
		panic(err)
	}
	if provider == nil {
		defaultProvider := &Provider{
			Owner:       "admin",
			Name:        "provider-storage-local",
			CreatedTime: GetCurrentTime(),
			DisplayName: "本地存储",
			Category:    "Storage",
			Type:        "Local File System",
			ClientId:    "./files",
			State:       "Active",
			IsDefault:   true,
		}
		_, err = adapter.engine.Insert(defaultProvider)
		if err != nil {
			panic(err)
		}
	}
}
