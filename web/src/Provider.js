// Copyright 2025 The OpenAgent Authors. All Rights Reserved.
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

import React from "react";
import {Tooltip} from "antd";
import * as Setting from "./Setting";

// Aligned with Casdoor web/src/auth/Provider.js (getProviderUrl + getProviderLogoWidget).

export function getProviderUrl(provider) {
  if (provider?.category === "OAuth") {
    return "";
  }
  const info = Setting.getOtherProviderInfo()[provider?.category]?.[provider?.type];
  if (info) {
    return info.url;
  }
  return "";
}

export function getProviderLogoWidget(provider, options = {}) {
  if (provider === undefined) {
    return null;
  }

  const url = getProviderUrl(provider);
  const disableLink = options.disableLink === true;
  const imgEl = (
    <img width={36} height={36} src={Setting.getProviderLogoURL(provider)} alt={provider.displayName || provider.type} />
  );

  if (url !== "" && !disableLink) {
    return (
      <Tooltip title={provider.type}>
        <a target="_blank" rel="noreferrer" href={url}>
          {imgEl}
        </a>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={provider.type}>
      {imgEl}
    </Tooltip>
  );
}
