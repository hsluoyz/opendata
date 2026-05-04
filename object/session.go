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

	"github.com/beego/beego"
	"github.com/the-open-data/opendata/util"
	"xorm.io/core"
)

type Session struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	SessionId []string `json:"sessionId"`
}

func GetSessions(owner string) ([]*Session, error) {
	sessions := []*Session{}
	var err error
	if owner != "" {
		err = adapter.engine.Desc("created_time").Where("owner = ?", owner).Find(&sessions)
	} else {
		err = adapter.engine.Desc("created_time").Find(&sessions)
	}
	return sessions, err
}

func GetPaginationSessions(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Session, error) {
	sessions := []*Session{}
	session := GetDbSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&sessions)
	return sessions, err
}

func GetSessionCount(owner, field, value string) (int64, error) {
	session := GetDbSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Session{})
}

func GetSession(id string) (*Session, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return nil, err
	}
	s := Session{Owner: owner, Name: name}
	found, err := adapter.engine.Get(&s)
	if err != nil {
		return &s, err
	}
	if !found {
		return nil, nil
	}
	return &s, nil
}

func UpdateSession(id string, session *Session) (bool, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return false, err
	}
	if ss, err := GetSession(id); err != nil {
		return false, err
	} else if ss == nil {
		return false, nil
	}
	affected, err := adapter.engine.ID(core.PK{owner, name}).Update(session)
	return affected != 0, err
}

func removeExtraSessionIds(session *Session) {
	if len(session.SessionId) > 100 {
		session.SessionId = session.SessionId[len(session.SessionId)-100:]
	}
}

func AddSession(session *Session) (bool, error) {
	dbSession, err := GetSession(session.GetId())
	if err != nil {
		return false, err
	}

	if dbSession == nil {
		session.CreatedTime = util.GetCurrentTime()
		affected, err := adapter.engine.Insert(session)
		return affected != 0, err
	}

	m := make(map[string]struct{})
	for _, v := range dbSession.SessionId {
		m[v] = struct{}{}
	}
	for _, v := range session.SessionId {
		if _, exists := m[v]; !exists {
			dbSession.SessionId = append(dbSession.SessionId, v)
		}
	}
	removeExtraSessionIds(dbSession)
	return UpdateSession(dbSession.GetId(), dbSession)
}

func DeleteSession(id string) (bool, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return false, err
	}
	session, err := GetSession(id)
	if err != nil {
		return false, err
	}
	if session != nil {
		DeleteBeegoSession(session.SessionId)
	}
	affected, err := adapter.engine.ID(core.PK{owner, name}).Delete(&Session{})
	return affected != 0, err
}

func DeleteSessionId(id string, sessionId string) (bool, error) {
	session, err := GetSession(id)
	if err != nil {
		return false, err
	}
	if session == nil {
		return false, nil
	}
	DeleteBeegoSession([]string{sessionId})
	session.SessionId = util.DeleteVal(session.SessionId, sessionId)
	if len(session.SessionId) == 0 {
		owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
		if err != nil {
			return false, err
		}
		affected, err := adapter.engine.ID(core.PK{owner, name}).Delete(&Session{})
		return affected != 0, err
	}
	return UpdateSession(id, session)
}

func DeleteBeegoSession(sessionIds []string) {
	for _, sessionId := range sessionIds {
		beego.GlobalSessions.GetProvider().SessionDestroy(sessionId)
	}
}

func IsSessionDuplicated(id string, sessionId string) (bool, error) {
	session, err := GetSession(id)
	if err != nil {
		return false, err
	}
	if session == nil {
		return false, nil
	}
	if len(session.SessionId) > 1 {
		return true, nil
	} else if len(session.SessionId) < 1 {
		return false, nil
	}
	return session.SessionId[0] != sessionId, nil
}

func (session *Session) GetId() string {
	return fmt.Sprintf("%s/%s", session.Owner, session.Name)
}
