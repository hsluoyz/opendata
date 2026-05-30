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
	"fmt"
	"net/url"

	"github.com/the-open-data/opendata/pdf"
)

func (c *ApiController) DownloadDistrictReport() {
	districtName := c.GetString("districtName")
	if districtName == "" {
		c.ResponseError("districtName is required")
		return
	}

	pdfBytes, err := pdf.GetDistrictReportPdfBytes(districtName)
	if err != nil {
		c.Ctx.ResponseWriter.Header().Set("Content-Type", "application/json")
		c.Ctx.ResponseWriter.WriteHeader(500)
		c.Ctx.ResponseWriter.Write([]byte(fmt.Sprintf(`{"status":"error","msg":"生成PDF失败: %s"}`, err.Error())))
		return
	}

	filename := fmt.Sprintf("%s科学教育诊断报告.pdf", districtName)
	c.Ctx.ResponseWriter.Header().Set("Content-Type", "application/pdf")
	c.Ctx.ResponseWriter.Header().Set("Content-Disposition",
		fmt.Sprintf("attachment; filename*=UTF-8''%s", url.PathEscape(filename)))
	c.Ctx.ResponseWriter.Header().Set("Content-Length", fmt.Sprintf("%d", len(pdfBytes)))
	c.Ctx.ResponseWriter.Write(pdfBytes)
}
