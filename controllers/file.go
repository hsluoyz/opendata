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

package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/beego/beego/utils/pagination"
	"github.com/the-open-data/opendata/object"
	"github.com/the-open-data/opendata/util"
)

func (c *ApiController) GetFiles() {
	if !c.RequireSignedIn() {
		return
	}
	owner := c.Input().Get("owner")
	limit := c.Input().Get("pageSize")
	page := c.Input().Get("p")
	field := c.Input().Get("field")
	value := c.Input().Get("value")
	sortField := c.Input().Get("sortField")
	sortOrder := c.Input().Get("sortOrder")

	if limit == "" || page == "" {
		files, err := object.GetFiles(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(files)
		return
	}

	limitInt := parseInt(limit)
	count, err := object.GetFileCount(owner, field, value)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	paginator := pagination.SetPaginator(c.Ctx, limitInt, count)
	files, err := object.GetPaginationFiles(owner, paginator.Offset(), limitInt, field, value, sortField, sortOrder)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(files, paginator.Nums())
}

func (c *ApiController) GetFileMeta() {
	if !c.RequireSignedIn() {
		return
	}
	id := c.Input().Get("id")
	file, err := object.GetFile(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(file)
}

func (c *ApiController) AddFile() {
	if !c.RequireSignedIn() {
		return
	}
	var file object.File
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &file); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	file.CreatedTime = object.GetCurrentTime()
	if file.Category == "" {
		file.Category = "folder"
	}
	affected, err := object.AddFile(&file)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) UpdateFile() {
	if !c.RequireSignedIn() {
		return
	}
	id := c.Input().Get("id")
	var file object.File
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &file); err != nil {
		c.ResponseError("请求格式错误")
		return
	}
	affected, err := object.UpdateFile(id, &file)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) DeleteFile() {
	if !c.RequireSignedIn() {
		return
	}
	var file object.File
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &file); err != nil {
		c.ResponseError("请求格式错误")
		return
	}

	// delete from storage if it's a real file
	if file.Category == "file" && file.StoragePath != "" {
		provider, err := object.GetDefaultStorageProvider()
		if err == nil && provider != nil {
			sp, err := provider.GetStorageProviderObj()
			if err == nil && sp != nil {
				_ = sp.DeleteObject(file.StoragePath)
			}
		}
	}

	affected, err := object.DeleteFile(&file)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

func (c *ApiController) UploadFile() {
	if !c.RequireSignedIn() {
		return
	}

	user := c.GetSessionUser()
	owner := c.Input().Get("owner")
	school := c.Input().Get("school")
	grade := c.Input().Get("grade")
	class := c.Input().Get("class")
	subject := c.Input().Get("subject")
	teacher := c.Input().Get("teacher")
	student := c.Input().Get("student")
	parent := c.Input().Get("parent")
	folder := c.Input().Get("folder")
	fileType := c.Input().Get("type")
	tag := c.Input().Get("tag")

	f, header, err := c.Ctx.Request.FormFile("file")
	if err != nil {
		c.ResponseError(fmt.Sprintf("获取文件失败: %v", err))
		return
	}
	defer f.Close()

	// read file into buffer
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(f)
	if err != nil {
		c.ResponseError(fmt.Sprintf("读取文件失败: %v", err))
		return
	}

	// get storage provider
	provider, err := object.GetDefaultStorageProvider()
	if err != nil || provider == nil {
		c.ResponseError("未配置存储提供商")
		return
	}
	sp, err := provider.GetStorageProviderObj()
	if err != nil {
		c.ResponseError(fmt.Sprintf("存储初始化失败: %v", err))
		return
	}

	// generate unique key for the file (Casdoor-style: Unix nano string avoids Windows-invalid names from RFC3339)
	fileName := header.Filename
	ext := filepath.Ext(fileName)
	fileId := fmt.Sprintf("%s-%s%s", util.GetCurrentUnixTime(), sanitizeFileName(fileName), ext)
	if owner != "" {
		fileId = owner + "/" + fileId
	}
	if strings.Contains(fileId, "..") {
		c.ResponseError("文件路径不合法：不允许包含 \"..\"")
		return
	}

	storagePath, err := sp.PutObject(user.Name, "", fileId, buf)
	if err != nil {
		c.ResponseError(fmt.Sprintf("文件存储失败: %v", err))
		return
	}

	// determine MIME type from extension
	mimeType := getMimeType(ext)

	// create file object
	fileObj := &object.File{
		Owner:       owner,
		Name:        fmt.Sprintf("file-%s", util.GetCurrentUnixTime()),
		CreatedTime: object.GetCurrentTime(),
		DisplayName: fileName,
		Category:    "file",
		Type:        fileType,
		Folder:      folder,
		School:      school,
		Grade:       grade,
		Class:       class,
		Subject:     subject,
		Teacher:     teacher,
		Student:     student,
		Parent:      parent,
		Uploader:    user.Name,
		Tag:         tag,
		StoragePath: storagePath,
		Url:         "/api/download-file?path=" + storagePath,
		Size:        int64(buf.Len()),
		FileType:    mimeType,
	}

	_, err = object.AddFile(fileObj)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(fileObj)
}

func (c *ApiController) DownloadFile() {
	if !c.RequireSignedIn() {
		return
	}
	path := c.Input().Get("path")
	if path == "" {
		c.ResponseError("文件路径不能为空")
		return
	}

	provider, err := object.GetDefaultStorageProvider()
	if err != nil || provider == nil {
		c.ResponseError("未配置存储提供商")
		return
	}

	// for local file system, serve directly
	c.Ctx.Output.Download(path, filepath.Base(path))
}

func sanitizeFileName(name string) string {
	// remove extension and sanitize
	base := strings.TrimSuffix(name, filepath.Ext(name))
	// replace unsafe chars
	safe := strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			return r
		}
		return '-'
	}, base)
	if len(safe) > 50 {
		safe = safe[:50]
	}
	return safe
}

func getMimeType(ext string) string {
	switch strings.ToLower(ext) {
	case ".pdf":
		return "application/pdf"
	case ".doc", ".docx":
		return "application/msword"
	case ".xls", ".xlsx":
		return "application/vnd.ms-excel"
	case ".ppt", ".pptx":
		return "application/vnd.ms-powerpoint"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".mp4":
		return "video/mp4"
	case ".mp3":
		return "audio/mpeg"
	case ".zip":
		return "application/zip"
	case ".txt":
		return "text/plain"
	default:
		return "application/octet-stream"
	}
}
