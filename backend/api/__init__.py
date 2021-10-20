# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Optional

from fastapi import HTTPException, Request
from fastapi.security import OAuth2PasswordBearer

from bubbles.backend.auth import JWT, JWTDenyList, JWTMgr
from bubbles.bubbles import Bubbles


class JWTAuthSchema(OAuth2PasswordBearer):
    def __init__(self) -> None:
        super().__init__(tokenUrl="auth/login")

    async def __call__(self, request: Request) -> Optional[JWT]:  # type: ignore[override]
        bubbles: Bubbles = request.app.state.bubbles
        jwt_mgr = JWTMgr(bubbles.config.options.auth)

        # Get and validate the token.
        token = jwt_mgr.get_token_from_cookie(request)
        if token is None:
            # Fallback: Try to get it from the headers.
            token = await super().__call__(request)
        if not token:
            raise HTTPException(
                status_code=400, detail="Token missing from request"
            )

        # Decode token and do the following checks:
        try:
            raw_token: JWT = jwt_mgr.get_raw_access_token(token)
        except Exception as e:
            raise HTTPException(status_code=401, detail=str(e))

        # - Is the token revoked?
        deny_list = JWTDenyList(bubbles.mgr)
        deny_list.load()
        if deny_list.includes(raw_token):
            raise HTTPException(
                status_code=401, detail="Token has been revoked"
            )
        return raw_token


jwt_auth_scheme = JWTAuthSchema()
