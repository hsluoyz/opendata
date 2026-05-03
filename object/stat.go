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

type Stats struct {
	SchoolCount  int64 `json:"schoolCount"`
	GradeCount   int64 `json:"gradeCount"`
	ClassCount   int64 `json:"classCount"`
	SubjectCount int64 `json:"subjectCount"`
	TeacherCount int64 `json:"teacherCount"`
	StudentCount int64 `json:"studentCount"`
	ParentCount  int64 `json:"parentCount"`
	FileCount    int64 `json:"fileCount"`
	FolderCount  int64 `json:"folderCount"`
}

func GetStats(schoolName string) (*Stats, error) {
	stats := &Stats{}

	if schoolName == "" {
		// global stats
		var err error
		stats.SchoolCount, err = adapter.engine.Count(&School{})
		if err != nil {
			return nil, err
		}
		stats.GradeCount, err = adapter.engine.Count(&Grade{})
		if err != nil {
			return nil, err
		}
		stats.ClassCount, err = adapter.engine.Count(&Class{})
		if err != nil {
			return nil, err
		}
		stats.SubjectCount, err = adapter.engine.Count(&Subject{})
		if err != nil {
			return nil, err
		}
		stats.TeacherCount, err = adapter.engine.Count(&Teacher{})
		if err != nil {
			return nil, err
		}
		stats.StudentCount, err = adapter.engine.Count(&Student{})
		if err != nil {
			return nil, err
		}
		stats.ParentCount, err = adapter.engine.Count(&Parent{})
		if err != nil {
			return nil, err
		}
		stats.FileCount, err = adapter.engine.Where("category=?", "file").Count(&File{})
		if err != nil {
			return nil, err
		}
		stats.FolderCount, err = adapter.engine.Where("category=?", "folder").Count(&File{})
		if err != nil {
			return nil, err
		}
	} else {
		// school-scoped stats
		var err error
		stats.SchoolCount = 1
		stats.GradeCount, err = adapter.engine.Where("owner=?", schoolName).Count(&Grade{})
		if err != nil {
			return nil, err
		}
		stats.ClassCount, err = adapter.engine.Where("owner=?", schoolName).Count(&Class{})
		if err != nil {
			return nil, err
		}
		stats.SubjectCount, err = adapter.engine.Where("owner=?", schoolName).Count(&Subject{})
		if err != nil {
			return nil, err
		}
		stats.TeacherCount, err = adapter.engine.Where("owner=?", schoolName).Count(&Teacher{})
		if err != nil {
			return nil, err
		}
		stats.StudentCount, err = adapter.engine.Where("owner=?", schoolName).Count(&Student{})
		if err != nil {
			return nil, err
		}
		stats.ParentCount, err = adapter.engine.Where("owner=?", schoolName).Count(&Parent{})
		if err != nil {
			return nil, err
		}
		stats.FileCount, err = adapter.engine.Where("owner=? AND category=?", schoolName, "file").Count(&File{})
		if err != nil {
			return nil, err
		}
		stats.FolderCount, err = adapter.engine.Where("owner=? AND category=?", schoolName, "folder").Count(&File{})
		if err != nil {
			return nil, err
		}
	}
	return stats, nil
}
