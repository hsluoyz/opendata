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
	"bufio"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	gitobject "github.com/go-git/go-git/v5/plumbing/object"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
)

type SystemInfo struct {
	CpuUsage     []float64 `json:"cpuUsage"`
	MemoryUsed   uint64    `json:"memoryUsed"`
	MemoryTotal  uint64    `json:"memoryTotal"`
	DiskUsed     uint64    `json:"diskUsed"`
	DiskTotal    uint64    `json:"diskTotal"`
	NetworkSent  uint64    `json:"networkSent"`
	NetworkRecv  uint64    `json:"networkRecv"`
	NetworkTotal uint64    `json:"networkTotal"`
}

type VersionInfo struct {
	Version      string `json:"version"`
	CommitId     string `json:"commitId"`
	CommitOffset int    `json:"commitOffset"`
}

func getCpuUsage() ([]float64, error) {
	return cpu.Percent(time.Second, true)
}

func getMemoryUsage() (uint64, uint64, error) {
	virtualMem, err := mem.VirtualMemory()
	if err != nil {
		return 0, 0, err
	}

	proc, err := process.NewProcess(int32(os.Getpid()))
	if err != nil {
		return 0, 0, err
	}

	memInfo, err := proc.MemoryInfo()
	if err != nil {
		return 0, 0, err
	}

	return memInfo.RSS, virtualMem.Total, nil
}

func getDiskUsage() (uint64, uint64, error) {
	_, filename, _, _ := runtime.Caller(0)
	rootPath := path.Dir(path.Dir(filename))
	dataPath := filepath.Join(rootPath, "data")

	var size uint64
	filepath.Walk(dataPath, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if !info.IsDir() {
			size += uint64(info.Size())
		}
		return nil
	})

	diskStat, err := disk.Usage(dataPath)
	if err != nil {
		diskStat, err = disk.Usage("/")
		if err != nil {
			return 0, 0, err
		}
	}

	return size, diskStat.Total, nil
}

func getNetworkUsage() (uint64, uint64, uint64, error) {
	proc, err := process.NewProcess(int32(os.Getpid()))
	if err != nil {
		return 0, 0, 0, err
	}

	ioCounters, err := proc.IOCounters()
	if err != nil {
		return 0, 0, 0, err
	}
	sent := ioCounters.WriteBytes
	recv := ioCounters.ReadBytes
	return sent, recv, sent + recv, nil
}

func GetSystemInfo() (*SystemInfo, error) {
	cpuUsage, err := getCpuUsage()
	if err != nil {
		return nil, err
	}

	memUsed, memTotal, err := getMemoryUsage()
	if err != nil {
		return nil, err
	}

	diskUsed, diskTotal, err := getDiskUsage()
	if err != nil {
		return nil, err
	}

	netSent, netRecv, netTotal, err := getNetworkUsage()
	if err != nil {
		return nil, err
	}

	return &SystemInfo{
		CpuUsage:     cpuUsage,
		MemoryUsed:   memUsed,
		MemoryTotal:  memTotal,
		DiskUsed:     diskUsed,
		DiskTotal:    diskTotal,
		NetworkSent:  netSent,
		NetworkRecv:  netRecv,
		NetworkTotal: netTotal,
	}, nil
}

func GetVersionInfo() (*VersionInfo, error) {
	res := &VersionInfo{Version: "", CommitId: "", CommitOffset: -1}

	_, filename, _, _ := runtime.Caller(0)
	rootPath := path.Dir(path.Dir(filename))
	r, err := git.PlainOpen(rootPath)
	if err != nil {
		return res, err
	}
	ref, err := r.Head()
	if err != nil {
		return res, err
	}
	tags, err := r.Tags()
	if err != nil {
		return res, err
	}
	tagMap := make(map[plumbing.Hash]string)
	tags.ForEach(func(t *plumbing.Reference) error {
		revHash, err := r.ResolveRevision(plumbing.Revision(t.Name()))
		if err != nil {
			return err
		}
		tagMap[*revHash] = t.Name().Short()
		return nil
	})

	cIter, err := r.Log(&git.LogOptions{From: ref.Hash()})
	if err != nil {
		return res, err
	}

	commitOffset := 0
	version := ""
	cIter.ForEach(func(c *gitobject.Commit) error {
		if tag, ok := tagMap[c.Hash]; ok && version == "" {
			version = tag
		}
		if version == "" {
			commitOffset++
		}
		return nil
	})

	return &VersionInfo{
		Version:      version,
		CommitId:     ref.Hash().String(),
		CommitOffset: commitOffset,
	}, nil
}

func GetVersionInfoFromFile() (*VersionInfo, error) {
	res := &VersionInfo{Version: "", CommitId: "", CommitOffset: -1}

	_, filename, _, _ := runtime.Caller(0)
	rootPath := path.Dir(path.Dir(filename))
	file, err := os.Open(filepath.Clean(path.Join(rootPath, "version_info.txt")))
	if err != nil {
		return res, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		re := regexp.MustCompile(`\{([^{}]+)\}`)
		matches := re.FindStringSubmatch(scanner.Text())
		if len(matches) > 1 {
			parts := strings.Split(matches[1], " ")
			offset, _ := strconv.Atoi(parts[2])
			res = &VersionInfo{Version: parts[0], CommitId: parts[1], CommitOffset: offset}
			break
		}
	}
	return res, scanner.Err()
}
