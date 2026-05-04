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
	"sort"
	"strconv"
	"sync"
	"time"
)

// DashboardTrend holds 30-day cumulative growth trend data.
type DashboardTrend struct {
	Dates         []string `json:"dates"`
	StudentCounts []int64  `json:"studentCounts"`
	TeacherCounts []int64  `json:"teacherCounts"`
	ClassCounts   []int64  `json:"classCounts"`
	FileCounts    []int64  `json:"fileCounts"`
}

// FileTypeCount represents file count per type.
type FileTypeCount struct {
	Type  string `json:"type"`
	Count int64  `json:"count"`
}

// SchoolEntityCount holds per-school entity counts.
type SchoolEntityCount struct {
	School       string `json:"school"`
	StudentCount int64  `json:"studentCount"`
	TeacherCount int64  `json:"teacherCount"`
	ClassCount   int64  `json:"classCount"`
}

// DayActivityCount represents activity count for a single day.
type DayActivityCount struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

// DashboardHeatmap holds operation activity heatmap data for the past year.
type DashboardHeatmap struct {
	Data      []DayActivityCount `json:"data"`
	MaxCount  int                `json:"maxCount"`
	DateRange [2]string          `json:"dateRange"`
}

// getBaselineCount returns the total count of records in a table created before startDate.
func getBaselineCount(table, school, startDate string) (int64, error) {
	session := adapter.engine.Table(table).
		Where("SUBSTR(created_time, 1, 10) < ?", startDate)
	if school != "" {
		session = session.And("owner = ?", school)
	}
	if table == "file" {
		session = session.And("category = ?", "file")
	}
	return session.Count()
}

// getDailyNewCounts returns a map of date -> new record count for the given date range.
func getDailyNewCounts(table, school, startDate, endDate string) (map[string]int64, error) {
	sql := fmt.Sprintf(
		"SELECT SUBSTR(created_time, 1, 10) AS day, COUNT(*) AS cnt FROM `%s` WHERE SUBSTR(created_time, 1, 10) >= ? AND SUBSTR(created_time, 1, 10) <= ?",
		table)
	args := []interface{}{startDate, endDate}
	if school != "" {
		sql += " AND owner = ?"
		args = append(args, school)
	}
	if table == "file" {
		sql += " AND category = 'file'"
	}
	sql += " GROUP BY day ORDER BY day"

	queryArgs := append([]interface{}{sql}, args...)
	rows, err := adapter.engine.QueryString(queryArgs...)
	if err != nil {
		return nil, err
	}

	counts := make(map[string]int64, len(rows))
	for _, row := range rows {
		if cnt, err2 := strconv.ParseInt(row["cnt"], 10, 64); err2 == nil {
			counts[row["day"]] = cnt
		}
	}
	return counts, nil
}

// buildCumulativeCounts computes cumulative daily counts from a baseline and daily increments.
func buildCumulativeCounts(baseline int64, daily map[string]int64, fullDates []string) []int64 {
	counts := make([]int64, len(fullDates))
	running := baseline
	for i, date := range fullDates {
		running += daily[date]
		counts[i] = running
	}
	return counts
}

// GetDashboardTrend returns 30-day cumulative growth trend for students, teachers, classes, files.
func GetDashboardTrend(schoolName string) (*DashboardTrend, error) {
	now := time.Now()
	startDay := now.AddDate(0, 0, -29)

	dates := make([]string, 30)
	fullDates := make([]string, 30)
	for i := 0; i < 30; i++ {
		d := startDay.AddDate(0, 0, i)
		dates[i] = d.Format("01-02")
		fullDates[i] = d.Format("2006-01-02")
	}

	startStr := fullDates[0]
	endStr := fullDates[29]

	tables := []string{"student", "teacher", "class", "file"}
	results := make([][]int64, 4)
	errs := make([]error, 4)

	var wg sync.WaitGroup
	for i, table := range tables {
		i, table := i, table
		wg.Add(1)
		go func() {
			defer wg.Done()
			baseline, err := getBaselineCount(table, schoolName, startStr)
			if err != nil {
				errs[i] = err
				return
			}
			daily, err := getDailyNewCounts(table, schoolName, startStr, endStr)
			if err != nil {
				errs[i] = err
				return
			}
			results[i] = buildCumulativeCounts(baseline, daily, fullDates)
		}()
	}
	wg.Wait()

	for _, err := range errs {
		if err != nil {
			return nil, err
		}
	}

	return &DashboardTrend{
		Dates:         dates,
		StudentCounts: results[0],
		TeacherCounts: results[1],
		ClassCounts:   results[2],
		FileCounts:    results[3],
	}, nil
}

// GetDashboardFileTypeDist returns file count grouped by type.
func GetDashboardFileTypeDist(schoolName string) ([]*FileTypeCount, error) {
	sql := "SELECT COALESCE(NULLIF(type, ''), '其他') AS file_type, COUNT(*) AS cnt FROM `file` WHERE category = 'file'"
	args := []interface{}{}
	if schoolName != "" {
		sql += " AND owner = ?"
		args = append(args, schoolName)
	}
	sql += " GROUP BY file_type ORDER BY cnt DESC"

	queryArgs := append([]interface{}{sql}, args...)
	rows, err := adapter.engine.QueryString(queryArgs...)
	if err != nil {
		return nil, err
	}

	dist := make([]*FileTypeCount, 0, len(rows))
	for _, row := range rows {
		cnt, _ := strconv.ParseInt(row["cnt"], 10, 64)
		dist = append(dist, &FileTypeCount{
			Type:  row["file_type"],
			Count: cnt,
		})
	}
	return dist, nil
}

// GetDashboardSchoolDist returns per-school entity counts (top 10 by student count).
func GetDashboardSchoolDist() ([]*SchoolEntityCount, error) {
	schools, err := GetGlobalSchools()
	if err != nil {
		return nil, err
	}

	dist := make([]*SchoolEntityCount, 0, len(schools))
	for _, school := range schools {
		studentCount, err := adapter.engine.Where("owner = ?", school.Name).Count(&Student{})
		if err != nil {
			return nil, err
		}
		teacherCount, err := adapter.engine.Where("owner = ?", school.Name).Count(&Teacher{})
		if err != nil {
			return nil, err
		}
		classCount, err := adapter.engine.Where("owner = ?", school.Name).Count(&Class{})
		if err != nil {
			return nil, err
		}
		name := school.DisplayName
		if name == "" {
			name = school.Name
		}
		dist = append(dist, &SchoolEntityCount{
			School:       name,
			StudentCount: studentCount,
			TeacherCount: teacherCount,
			ClassCount:   classCount,
		})
	}

	sort.Slice(dist, func(i, j int) bool {
		return dist[i].StudentCount > dist[j].StudentCount
	})
	if len(dist) > 10 {
		dist = dist[:10]
	}
	return dist, nil
}

// GetDashboardHeatmap returns operation activity heatmap data for the past year.
func GetDashboardHeatmap(schoolName string) (*DashboardHeatmap, error) {
	endDate := time.Now()
	startDate := endDate.AddDate(-1, 0, 0)

	startStr := startDate.Format("2006-01-02")
	endStr := endDate.Format("2006-01-02")

	sql := "SELECT SUBSTR(created_time, 1, 10) AS day, COUNT(*) AS cnt FROM `record` WHERE SUBSTR(created_time, 1, 10) >= ? AND SUBSTR(created_time, 1, 10) <= ?"
	args := []interface{}{startStr, endStr}
	if schoolName != "" {
		sql += " AND owner = ?"
		args = append(args, schoolName)
	}
	sql += " GROUP BY day ORDER BY day"

	queryArgs := append([]interface{}{sql}, args...)
	rows, err := adapter.engine.QueryString(queryArgs...)
	if err != nil {
		return nil, err
	}

	data := make([]DayActivityCount, 0, len(rows))
	maxCount := 0
	for _, row := range rows {
		cnt, _ := strconv.Atoi(row["cnt"])
		if cnt > maxCount {
			maxCount = cnt
		}
		data = append(data, DayActivityCount{Date: row["day"], Count: cnt})
	}

	return &DashboardHeatmap{
		Data:      data,
		MaxCount:  maxCount,
		DateRange: [2]string{startStr, endStr},
	}, nil
}
