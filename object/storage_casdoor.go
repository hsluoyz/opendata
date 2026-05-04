// Copyright 2021 The Casdoor Authors. All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
// Adapted from Casdoor object/storage.go for OpenData (upload URL + object key, delete by key).

package object

import (
	"bytes"
	"fmt"
	"net/url"
	"path"
	"path/filepath"
	"strings"

	"github.com/casdoor/oss"
	"github.com/the-open-data/opendata/conf"
	"github.com/the-open-data/opendata/storage"
	"github.com/the-open-data/opendata/util"
)

var isCloudIntranet bool

const (
	ProviderTypeGoogleCloudStorage = "Google Cloud Storage"
	ProviderTypeTencentCloudCOS    = "Tencent Cloud COS"
	ProviderTypeAzureBlob          = "Azure Blob"
	ProviderTypeLocalFileSystem    = "Local File System"
	ProviderTypeMinIO              = "MinIO"
)

func init() {
	isCloudIntranet = conf.GetConfigBool("isCloudIntranet")
}

func getProviderEndpoint(provider *Provider) string {
	endpoint := provider.Endpoint
	if provider.IntranetEndpoint != "" && isCloudIntranet {
		endpoint = provider.IntranetEndpoint
	}
	return endpoint
}

func escapePath(p string) string {
	tokens := strings.Split(p, "/")
	if len(tokens) > 0 {
		tokens[len(tokens)-1] = url.QueryEscape(tokens[len(tokens)-1])
	}
	return strings.Join(tokens, "/")
}

func GetTruncatedPath(provider *Provider, fullFilePath string, limit int) string {
	pathPrefix := util.UrlJoin(util.GetUrlPath(provider.Domain), provider.PathPrefix)

	dir, file := filepath.Split(fullFilePath)
	ext := filepath.Ext(file)
	fileName := strings.TrimSuffix(file, ext)
	for {
		escapedString := escapePath(escapePath(fullFilePath))
		if len(escapedString) < limit-len(pathPrefix) {
			break
		}
		rs := []rune(fileName)
		if len(rs) <= 1 {
			break
		}
		fileName = string(rs[0 : len(rs)-1])
		fullFilePath = dir + fileName + ext
	}

	return fullFilePath
}

func GetUploadFileUrl(provider *Provider, fullFilePath string, hasTimestamp bool) (string, string) {
	if provider.Domain != "" && !strings.HasPrefix(provider.Domain, "http://") && !strings.HasPrefix(provider.Domain, "https://") {
		provider.Domain = fmt.Sprintf("https://%s", provider.Domain)
	}

	escapedPath := util.UrlJoin(provider.PathPrefix, fullFilePath)
	objectKey := util.UrlJoin(util.GetUrlPath(provider.Domain), escapedPath)

	host := ""
	if provider.Type != ProviderTypeLocalFileSystem {
		host = util.GetUrlHost(provider.Domain)
	} else {
		host = util.UrlJoin(provider.Domain, "/files")
	}
	if provider.Type == ProviderTypeAzureBlob || provider.Type == ProviderTypeGoogleCloudStorage {
		host = util.UrlJoin(host, provider.Bucket)
	}

	fileUrl := ""
	if host != "" {
		fileUrl = util.UrlJoin(host, objectKey)
	}

	if provider.Type == ProviderTypeTencentCloudCOS {
		objectKey = escapePath(objectKey)
	}

	return fileUrl, objectKey
}

func getStorageProviderForUpload(provider *Provider) (oss.StorageInterface, error) {
	endpoint := getProviderEndpoint(provider)
	storageProvider, err := storage.GetStorageProvider(provider.Type, provider.ClientId, provider.ClientSecret, provider.RegionId, provider.Bucket, endpoint, "", provider.Content)
	if err != nil {
		return nil, err
	}
	if storageProvider == nil {
		return nil, fmt.Errorf("the provider type: %s is not supported", provider.Type)
	}

	if provider.Domain == "" {
		provider.Domain = storageProvider.GetEndpoint()
		_, err = UpdateProvider(provider.GetId(), provider)
		if err != nil {
			return nil, err
		}
	}

	return storageProvider, nil
}

func uploadFile(provider *Provider, fullFilePath string, fileBuffer *bytes.Buffer) (string, string, error) {
	storageProvider, err := getStorageProviderForUpload(provider)
	if err != nil {
		return "", "", err
	}

	fileUrl, objectKey := GetUploadFileUrl(provider, fullFilePath, true)
	objectKeyRefined := refineObjectKey(provider, objectKey)

	_, err = storageProvider.Put(objectKeyRefined, fileBuffer)
	if err != nil {
		return "", "", err
	}

	return fileUrl, objectKey, nil
}

// UploadStorageFileSafe uploads bytes like Casdoor UploadFileSafe and returns (public fileUrl, objectKey for delete).
func UploadStorageFileSafe(provider *Provider, fullFilePath string, fileBuffer *bytes.Buffer) (string, string, error) {
	if strings.Contains(fullFilePath, "..") {
		return "", "", fmt.Errorf("the fullFilePath: %s is not allowed", fullFilePath)
	}

	var fileUrl string
	var objectKey string
	var err error
	times := 0
	for {
		fileUrl, objectKey, err = uploadFile(provider, fullFilePath, fileBuffer)
		if err != nil {
			times++
			if times >= 5 {
				return "", "", err
			}
		} else {
			break
		}
	}
	return fileUrl, objectKey, nil
}

// DeleteStorageFile deletes the object by key (Casdoor DeleteFile).
func DeleteStorageFile(provider *Provider, objectKey string) error {
	if strings.Contains(objectKey, "..") {
		return fmt.Errorf("the objectKey: %s is not allowed", objectKey)
	}

	storageProvider, err := getStorageProviderForUpload(provider)
	if err != nil {
		return err
	}

	objectKeyRefined := refineObjectKey(provider, objectKey)
	return storageProvider.Delete(objectKeyRefined)
}

func refineObjectKey(provider *Provider, objectKey string) string {
	if provider.Type == ProviderTypeGoogleCloudStorage {
		return strings.TrimPrefix(objectKey, "/")
	}

	if provider.Type == ProviderTypeMinIO && provider.PathPrefix != "" {
		p := path.Join("/", strings.Trim(provider.PathPrefix, "/"))
		if strings.HasPrefix(objectKey, p+"/") {
			return strings.TrimPrefix(objectKey, p+"/")
		}
	}

	return objectKey
}
