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

import * as Setting from "../Setting";

export function getVisitors(days, selectedUser, fields) {
  return fetch(`${Setting.ServerUrl}/api/get-visitors?days=${days}&selectedUser=${selectedUser}&field=${fields}`, {
    method: "GET",
    credentials: "include",
  }).then(res => Setting.handleFetchResponse(res));
}
