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
	"time"

	"github.com/beego/beego"
	"github.com/the-open-data/opendata/auth"
	"github.com/the-open-data/opendata/conf"
	"github.com/the-open-data/opendata/object"
	"github.com/the-open-data/opendata/util"
)

func init() {
	InitAuthConfig()
}

func tryInitAuthConfig() error {
	casdoorEndpoint := conf.GetConfigString("casdoorEndpoint")
	clientId := conf.GetConfigString("clientId")
	clientSecret := conf.GetConfigString("clientSecret")
	casdoorOrganization := conf.GetConfigString("casdoorOrganization")
	casdoorApplication := conf.GetConfigString("casdoorApplication")

	auth.InitConfig(casdoorEndpoint, clientId, clientSecret, "", casdoorOrganization, casdoorApplication)

	application, err := auth.GetApplication(casdoorApplication)
	if err != nil {
		return err
	}
	if application == nil {
		return fmt.Errorf("application %q not found", casdoorApplication)
	}

	cert, err := auth.GetCert(application.Cert)
	if err != nil {
		return err
	}
	if cert == nil {
		return fmt.Errorf("cert %q not found", application.Cert)
	}

	auth.InitConfig(casdoorEndpoint, clientId, clientSecret, cert.Certificate, casdoorOrganization, casdoorApplication)
	conf.SetCasdoorAvailable(true)
	return nil
}

func InitAuthConfig() {
	casdoorEndpoint := conf.GetConfigString("casdoorEndpoint")
	if casdoorEndpoint == "" {
		conf.SetCasdoorAvailable(false)
		return
	}

	if err := tryInitAuthConfig(); err != nil {
		conf.SetCasdoorAvailable(false)
		beego.Warning("InitAuthConfig: casdoor unreachable, retrying in background:", err)
		go func() {
			for {
				time.Sleep(10 * time.Second)
				if err := tryInitAuthConfig(); err != nil {
					conf.SetCasdoorAvailable(false)
					beego.Warning("InitAuthConfig: retry failed:", err)
				} else {
					beego.Info("InitAuthConfig: casdoor connected")
					return
				}
			}
		}()
	}
}

func (c *ApiController) Signin() {
	code := c.Input().Get("code")
	state := c.Input().Get("state")

	token, err := auth.GetOAuthToken(code, state)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	claims, err := auth.ParseJwtToken(token.AccessToken)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	claims.AccessToken = token.AccessToken
	c.SetSessionClaims(claims)
	sessionId := c.Ctx.Input.CruSession.SessionID()
	if sessionId != "" {
		_, _ = object.AddSession(&object.Session{
			Owner:     claims.User.Owner,
			Name:      claims.User.Name,
			SessionId: []string{sessionId},
		})
	}
	c.ResponseOk(claims.User)
}

func (c *ApiController) Signout() {
	user := c.GetSessionUser()
	if user != nil {
		_, _ = object.DeleteSessionId(util.GetIdFromOwnerAndName(user.Owner, user.Name), c.Ctx.Input.CruSession.SessionID())
	}
	c.SetSessionClaims(nil)
	c.ResponseOk()
}

func (c *ApiController) GetAccount() {
	if err := util.AppendWebConfigCookie(c.Ctx); err != nil {
		fmt.Println(err)
	}

	claims := c.GetSessionClaims()
	if claims == nil {
		c.ResponseError("请先登录")
		return
	}

	if conf.IsCasdoorAvailable() {
		user, err := auth.GetUser(claims.User.Name)
		if err == nil && user != nil {
			claims.User = *user
			c.SetSessionClaims(claims)
		}
	}

	c.ResponseOk(claims.User)
}

func (c *ApiController) UpdateAccount() {
	claims := c.GetSessionClaims()
	if claims == nil {
		c.ResponseError("请先登录")
		return
	}
	c.ResponseOk(claims.User)
}
