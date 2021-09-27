# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
import httpx

from fastapi import HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional

from mgr_module import MgrModule


class RestApiProxyLoginModel(BaseModel):
    token: str = Field(title="The access token")
    username: str = Field(title="The user name")
    permissions: Dict[str, List[str]] = Field(title="The user privileges")
    pwdExpirationDate: Optional[int] = Field(title="The expiration date as Unix time stamp")
    sso: bool = Field(title="SSO used")
    pwdUpdateRequired: bool = Field(title="Password update required")


class RestApiProxyController:
    def __init__(self, mgr: MgrModule) -> None:
        self._access_token: Optional[str] = None
        self._base_url: Optional[str] = None
        self._mgr = mgr

    @property
    def base_url(self) -> Optional[str]:
        """
        Get the URL to the Ceph Dashboard UI.
        :return: The URL.
        """
        if not self._base_url:
            self._base_url = self._mgr.get("mgr_map").get(
                "services", {}).get("dashboard", None)
            if not self._base_url:
                return None
            self._base_url = self._base_url.rstrip("/")
        return self._base_url

    def connect(self, username: str, password: str) -> None:
        """
        Connect to the Dashboard REST API using the given credentials.
        :param username: The name of the user.
        :param password: The password.
        :return: If successful, the authentication token is returned,
            otherwise an exception is thrown.
        """
        response = self.request("POST", "/api/auth", json={
            "username": username,
            "password": password
        })
        # Store the token for further calls to the Dashboard REST API.
        login_response = RestApiProxyLoginModel.parse_obj(response)
        self._access_token = login_response.token

    def disconnect(self) -> None:
        """
        Disconnect from the Dashboard REST API.
        """
        self.request("POST", "/api/auth/logout")

    def request(
        self, method, path, params=None, data=None, json=None, verify=False
    ) -> Dict:
        """
        Perform a request to the Dashboard REST API.
        :param method: HTTP method for the new `Request` object: `GET`, `POST`, `PUT`, ...
        :param path: The API URL, e.g. '/api/foo/bar'.
        :param params: Query parameters to include in the URL.
        :param data: Form data to include in the body of the request, as a dictionary.
        :param json: A JSON serializable object to include in the body of the request.
        :param verify: Enable/disable verification.
        :return: Returns the response of the request.
        """
        headers = {"Accept": "application/vnd.ceph.api.v1.0+json"}
        if not self.base_url:
            raise HTTPException(
                status_code=500,
                detail=f"Dashboard manager module not running."
            )
        if self._access_token:
            headers["Authorization"] = f"Bearer {self._access_token}"
        if json:
            headers["Content-Type"] = "application/json"
        url = "{}/{}".format(self.base_url, path.lstrip("/"))
        response = httpx.request(
            method, url, params=params, data=data, json=json,
            headers=headers, verify=verify)
        content = response.json()
        if response.is_error:
            raise HTTPException(status_code=response.status_code,
                                detail=content["detail"])
        return content
