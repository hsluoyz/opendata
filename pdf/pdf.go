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

package pdf

import (
	"context"
	"fmt"
	"net/url"
	"time"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
)

func GetDistrictReportPdfBytes(districtName string, frontendBaseUrl string) ([]byte, error) {
	pageUrl := fmt.Sprintf("%s/district-report-raw/%s", frontendBaseUrl, url.PathEscape(districtName))

	options := append(
		chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-gpu", true),
	)

	allocCtx, cancelAlloc := chromedp.NewExecAllocator(context.Background(), options...)
	defer cancelAlloc()

	ctx, cancelCtx := chromedp.NewContext(allocCtx)
	defer cancelCtx()

	ctx, cancelTimeout := context.WithTimeout(ctx, 60*time.Second)
	defer cancelTimeout()

	var buf []byte
	err := chromedp.Run(ctx,
		chromedp.Navigate(pageUrl),
		chromedp.WaitReady(`#reportEnd`, chromedp.ByID),
		chromedp.ActionFunc(func(ctx context.Context) error {
			var err error
			buf, _, err = page.PrintToPDF().
				WithPaperWidth(8.3).
				WithPaperHeight(11.7).
				WithMarginTop(0.5).
				WithMarginBottom(0.5).
				WithMarginLeft(0.8).
				WithMarginRight(0.8).
				WithPrintBackground(true).
				Do(ctx)
			if err != nil {
				return fmt.Errorf("PrintToPDF failed: %w", err)
			}
			return nil
		}),
	)
	if err != nil {
		return nil, fmt.Errorf("chromedp failed for URL [%s]: %w", pageUrl, err)
	}

	return buf, nil
}
