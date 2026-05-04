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

type File struct {
	Owner       string   `xorm:"varchar(100) notnull pk" json:"owner"` // school name
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string   `xorm:"varchar(100)" json:"createdTime"`
	DisplayName string   `xorm:"varchar(500)" json:"displayName"` // file display name
	Category    string   `xorm:"varchar(100) index" json:"category"` // "file" or "folder"
	Type        string   `xorm:"varchar(100) index" json:"type"` // "课件", "教案", "作业", "试卷", "素材", etc.
	Folder      string   `xorm:"varchar(100) index" json:"folder"` // parent folder name (empty = root)
	School      string   `xorm:"varchar(100) index" json:"school"`
	Grade       string   `xorm:"varchar(100) index" json:"grade"`
	Class       string   `xorm:"varchar(100) index" json:"class"`
	Subject     string   `xorm:"varchar(100) index" json:"subject"`
	Teacher     string   `xorm:"varchar(100) index" json:"teacher"`
	Student     string   `xorm:"varchar(100) index" json:"student"`
	Parent      string   `xorm:"varchar(100) index" json:"parent"`
	Uploader    string   `xorm:"varchar(100) index" json:"uploader"` // username who uploaded
	Tag         string   `xorm:"varchar(500)" json:"tag"`
	Path        string   `xorm:"varchar(1000)" json:"path"` // storage object key for DeleteObject (Casdoor-style)
	Url         string   `xorm:"varchar(1000)" json:"url"` // full public URL for download / preview
	Size        int64    `xorm:"bigint" json:"size"`
	FileType    string   `xorm:"varchar(200)" json:"fileType"` // MIME type or extension
	Admins      []string `xorm:"mediumtext" json:"admins"`
	Viewers     []string `xorm:"mediumtext" json:"viewers"`
}

func (f *File) GetId() string {
	return fmt.Sprintf("%s/%s", f.Owner, f.Name)
}

func GetFiles(owner string) ([]*File, error) {
	files := []*File{}
	err := adapter.engine.Desc("created_time").Find(&files, &File{Owner: owner})
	return files, err
}

func GetFileCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&File{})
}

func GetPaginationFiles(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*File, error) {
	files := []*File{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&files)
	return files, err
}

func GetFile(id string) (*File, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return nil, err
	}
	return getFile(owner, name)
}

func getFile(owner, name string) (*File, error) {
	file := File{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&file)
	if err != nil {
		return nil, err
	}
	if existed {
		return &file, nil
	}
	return nil, nil
}

func AddFile(file *File) (bool, error) {
	affected, err := adapter.engine.Insert(file)
	return affected != 0, err
}

func UpdateFile(id string, file *File) (bool, error) {
	owner, name, err := getOwnerAndNameFromId(id)
	if err != nil {
		return false, err
	}
	_, err = adapter.engine.ID(core.PK{owner, name}).AllCols().Update(file)
	return err == nil, err
}

func DeleteFile(file *File) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{file.Owner, file.Name}).Delete(&File{})
	return affected != 0, err
}

// GetFilesByFolder returns files under a specific folder
func GetFilesByFolder(owner, folder string) ([]*File, error) {
	files := []*File{}
	err := adapter.engine.Desc("created_time").Find(&files, &File{Owner: owner, Folder: folder})
	return files, err
}
