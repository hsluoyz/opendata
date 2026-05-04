// Copyright 2021 The Casdoor Authors. All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
// Copied from Casdoor storage/storage.go (subset: Local + Aliyun OSS only).

package storage

import "github.com/casdoor/oss"

func GetStorageProvider(providerType string, clientId string, clientSecret string, region string, bucket string, endpoint string, cert string, content string) (oss.StorageInterface, error) {
	switch providerType {
	case "Local File System":
		return NewLocalFileSystemStorageProvider(), nil
	case "Aliyun OSS":
		return NewAliyunOssStorageProvider(clientId, clientSecret, region, bucket, endpoint), nil
	}
	return nil, nil
}
