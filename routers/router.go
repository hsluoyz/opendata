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

package routers

import (
	"github.com/beego/beego"
	"github.com/the-open-data/opendata/controllers"
)

func init() {
	initAPI()
}

func initAPI() {
	// Auth (Casdoor SSO)
	beego.Router("/api/signin", &controllers.ApiController{}, "POST:Signin")
	beego.Router("/api/signout", &controllers.ApiController{}, "POST:Signout")
	beego.Router("/api/get-account", &controllers.ApiController{}, "GET:GetAccount")
	beego.Router("/api/update-account", &controllers.ApiController{}, "POST:UpdateAccount")

	// Schools
	beego.Router("/api/get-schools", &controllers.ApiController{}, "GET:GetSchools")
	beego.Router("/api/get-school", &controllers.ApiController{}, "GET:GetSchool")
	beego.Router("/api/add-school", &controllers.ApiController{}, "POST:AddSchool")
	beego.Router("/api/update-school", &controllers.ApiController{}, "POST:UpdateSchool")
	beego.Router("/api/delete-school", &controllers.ApiController{}, "POST:DeleteSchool")

	// Grades
	beego.Router("/api/get-grades", &controllers.ApiController{}, "GET:GetGrades")
	beego.Router("/api/get-grade", &controllers.ApiController{}, "GET:GetGrade")
	beego.Router("/api/add-grade", &controllers.ApiController{}, "POST:AddGrade")
	beego.Router("/api/update-grade", &controllers.ApiController{}, "POST:UpdateGrade")
	beego.Router("/api/delete-grade", &controllers.ApiController{}, "POST:DeleteGrade")

	// Classes
	beego.Router("/api/get-classes", &controllers.ApiController{}, "GET:GetClasses")
	beego.Router("/api/get-class", &controllers.ApiController{}, "GET:GetClass")
	beego.Router("/api/add-class", &controllers.ApiController{}, "POST:AddClass")
	beego.Router("/api/update-class", &controllers.ApiController{}, "POST:UpdateClass")
	beego.Router("/api/delete-class", &controllers.ApiController{}, "POST:DeleteClass")

	// Subjects
	beego.Router("/api/get-subjects", &controllers.ApiController{}, "GET:GetSubjects")
	beego.Router("/api/get-subject", &controllers.ApiController{}, "GET:GetSubject")
	beego.Router("/api/add-subject", &controllers.ApiController{}, "POST:AddSubject")
	beego.Router("/api/update-subject", &controllers.ApiController{}, "POST:UpdateSubject")
	beego.Router("/api/delete-subject", &controllers.ApiController{}, "POST:DeleteSubject")

	// Teachers
	beego.Router("/api/get-teachers", &controllers.ApiController{}, "GET:GetTeachers")
	beego.Router("/api/get-teacher", &controllers.ApiController{}, "GET:GetTeacher")
	beego.Router("/api/add-teacher", &controllers.ApiController{}, "POST:AddTeacher")
	beego.Router("/api/update-teacher", &controllers.ApiController{}, "POST:UpdateTeacher")
	beego.Router("/api/delete-teacher", &controllers.ApiController{}, "POST:DeleteTeacher")

	// Students
	beego.Router("/api/get-students", &controllers.ApiController{}, "GET:GetStudents")
	beego.Router("/api/get-student", &controllers.ApiController{}, "GET:GetStudent")
	beego.Router("/api/add-student", &controllers.ApiController{}, "POST:AddStudent")
	beego.Router("/api/update-student", &controllers.ApiController{}, "POST:UpdateStudent")
	beego.Router("/api/delete-student", &controllers.ApiController{}, "POST:DeleteStudent")

	// Parents
	beego.Router("/api/get-parents", &controllers.ApiController{}, "GET:GetParents")
	beego.Router("/api/get-parent", &controllers.ApiController{}, "GET:GetParent")
	beego.Router("/api/add-parent", &controllers.ApiController{}, "POST:AddParent")
	beego.Router("/api/update-parent", &controllers.ApiController{}, "POST:UpdateParent")
	beego.Router("/api/delete-parent", &controllers.ApiController{}, "POST:DeleteParent")

	// Files
	beego.Router("/api/get-files", &controllers.ApiController{}, "GET:GetFiles")
	beego.Router("/api/get-file", &controllers.ApiController{}, "GET:GetFileMeta")
	beego.Router("/api/add-file", &controllers.ApiController{}, "POST:AddFile")
	beego.Router("/api/update-file", &controllers.ApiController{}, "POST:UpdateFile")
	beego.Router("/api/delete-file", &controllers.ApiController{}, "POST:DeleteFile")
	beego.Router("/api/upload-file", &controllers.ApiController{}, "POST:UploadFile")
	beego.Router("/api/download-file", &controllers.ApiController{}, "GET:DownloadFile")

	// Providers
	beego.Router("/api/get-providers", &controllers.ApiController{}, "GET:GetProviders")
	beego.Router("/api/get-provider", &controllers.ApiController{}, "GET:GetProvider")
	beego.Router("/api/add-provider", &controllers.ApiController{}, "POST:AddProvider")
	beego.Router("/api/update-provider", &controllers.ApiController{}, "POST:UpdateProvider")
	beego.Router("/api/delete-provider", &controllers.ApiController{}, "POST:DeleteProvider")

	// Stats
	beego.Router("/api/get-stats", &controllers.ApiController{}, "GET:GetStats")

	// Dashboard charts
	beego.Router("/api/get-dashboard-trend", &controllers.ApiController{}, "GET:GetDashboardTrend")
	beego.Router("/api/get-dashboard-file-type-dist", &controllers.ApiController{}, "GET:GetDashboardFileTypeDist")
	beego.Router("/api/get-dashboard-school-dist", &controllers.ApiController{}, "GET:GetDashboardSchoolDist")
	beego.Router("/api/get-dashboard-heatmap", &controllers.ApiController{}, "GET:GetDashboardHeatmap")

	// Records (Audit Logs)
	beego.Router("/api/get-records", &controllers.ApiController{}, "GET:GetRecords")
	beego.Router("/api/get-record", &controllers.ApiController{}, "GET:GetRecord")
	beego.Router("/api/update-record", &controllers.ApiController{}, "POST:UpdateRecord")
	beego.Router("/api/add-record", &controllers.ApiController{}, "POST:AddRecord")
	beego.Router("/api/add-records", &controllers.ApiController{}, "POST:AddRecords")
	beego.Router("/api/delete-record", &controllers.ApiController{}, "POST:DeleteRecord")

	// Sessions
	beego.Router("/api/get-sessions", &controllers.ApiController{}, "GET:GetSessions")
	beego.Router("/api/get-session", &controllers.ApiController{}, "GET:GetSingleSession")
	beego.Router("/api/update-session", &controllers.ApiController{}, "POST:UpdateSession")
	beego.Router("/api/add-session", &controllers.ApiController{}, "POST:AddSession")
	beego.Router("/api/delete-session", &controllers.ApiController{}, "POST:DeleteSession")
	beego.Router("/api/is-session-duplicated", &controllers.ApiController{}, "GET:IsSessionDuplicated")

	// Sites
	beego.Router("/api/get-global-sites", &controllers.ApiController{}, "GET:GetGlobalSites")
	beego.Router("/api/get-sites", &controllers.ApiController{}, "GET:GetSites")
	beego.Router("/api/get-site", &controllers.ApiController{}, "GET:GetSite")
	beego.Router("/api/get-built-in-site", &controllers.ApiController{}, "GET:GetBuiltInSite")
	beego.Router("/api/update-site", &controllers.ApiController{}, "POST:UpdateSite")
	beego.Router("/api/add-site", &controllers.ApiController{}, "POST:AddSite")
	beego.Router("/api/delete-site", &controllers.ApiController{}, "POST:DeleteSite")

	// Visitors
	beego.Router("/api/get-visitors", &controllers.ApiController{}, "GET:GetVisitors")

	// System Info
	beego.Router("/api/get-system-info", &controllers.ApiController{}, "GET:GetSystemInfo")
	beego.Router("/api/get-version-info", &controllers.ApiController{}, "GET:GetVersionInfo")

	// Prometheus
	beego.Router("/api/get-prometheus-info", &controllers.ApiController{}, "GET:GetPrometheusInfo")
	beego.Router("/api/metrics", &controllers.ApiController{}, "GET:GetMetrics")

	// Health
	beego.Router("/api/health", &controllers.ApiController{}, "GET:Health")
}
