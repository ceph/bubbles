# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, NamedTuple, Optional, Union

from mgr_module import MgrModule

import jwt
from fastapi import Request, Response
from fastapi.security.utils import get_authorization_scheme_param

from bubbles.backend.models.config import AuthOptionsModel


class JWT(NamedTuple):
    iss: str  # Issuer
    sub: Union[str, int]  # Subject
    iat: int  # Issued at
    nbf: int  # Not before
    exp: int  # Expiration time
    jti: str  # JWT ID


class JWTMgr:
    JWT_ISSUER = "Bubbles"
    JWT_ALGORITHM = "HS256"
    COOKIE_KEY = "access_token"

    def __init__(self, config: AuthOptionsModel):
        self._config: AuthOptionsModel = config

    def create_access_token(self, subject: Union[str, int]) -> str:
        now = int(datetime.now(timezone.utc).timestamp())
        payload = JWT(
            iss=self.JWT_ISSUER,
            sub=subject,
            iat=now,
            nbf=now,
            exp=now + self._config.jwt_ttl,
            jti=str(uuid.uuid4()),
        )._asdict()
        encoded_token = jwt.encode(
            payload, self._config.jwt_secret, algorithm=self.JWT_ALGORITHM
        )
        return encoded_token

    def get_raw_access_token(self, token: str, verify: bool = True) -> JWT:
        options = {}
        if not verify:
            options = {"verify_signature": False}
        raw_token = jwt.decode(
            token,
            self._config.jwt_secret,
            algorithms=[self.JWT_ALGORITHM],
            options=options,
        )
        return JWT(**raw_token)

    @staticmethod
    def set_token_cookie(response: Response, token: str) -> None:
        response.set_cookie(
            key=JWTMgr.COOKIE_KEY,
            value=f"Bearer {token}",
            httponly=True,
            samesite="strict",
        )

    @staticmethod
    def get_token_from_cookie(request: Request) -> Optional[str]:
        value: Optional[str] = request.cookies.get(JWTMgr.COOKIE_KEY)
        if value is None:
            return None
        scheme, token = get_authorization_scheme_param(value)
        if scheme.lower() == "bearer":
            return token
        return None


class JWTDenyList:
    """
    This list contains JWT tokens that are not allowed to use anymore.
    E.g. a token is added when a user logs out of the UI. The list will
    automatically remove expired tokens.
    """

    def __init__(self, mgr: MgrModule):
        self._mgr = mgr
        self._jti_dict: Dict[str, int] = {}

    def _cleanup(self, now: int) -> None:
        self._jti_dict = {
            jti: exp for jti, exp in self._jti_dict.items() if exp > now
        }

    def load(self) -> None:
        self._jti_dict = {}
        value = self._mgr.get_store("jwt_deny_list")
        if value is not None:
            self._jti_dict = json.loads(value)
            now = int(datetime.now(timezone.utc).timestamp())
            self._cleanup(now)

    def save(self) -> None:
        self._mgr.set_store("jwt_deny_list", json.dumps(self._jti_dict))

    def add(self, token: JWT) -> None:
        self._jti_dict[token.jti] = token.exp

    def includes(self, token: JWT) -> bool:
        return token.jti in self._jti_dict
