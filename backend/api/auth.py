# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from fastapi import APIRouter, Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm

from bubbles.bubbles import Bubbles
from bubbles.backend.api import jwt_auth_scheme
from bubbles.backend.auth import JWT, JWTDenyList, JWTMgr
from bubbles.backend.models.auth import LoginModel

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginModel)
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> LoginModel:
    bubbles: Bubbles = request.app.state.bubbles
    # Connect to the Dashboard REST API with the given credentials.
    # This way we can rely on the Dashboard user management;
    # additionally we can now call endpoints of the official
    # Ceph REST API.
    assert bubbles.ctrls.rest_api_proxy is not None
    bubbles.ctrls.rest_api_proxy.connect(form_data.username,
                                         form_data.password)
    # At this point we are sure the user has been successfully
    # authenticated.
    jwt_mgr = JWTMgr(bubbles.config.options.auth)
    access_token = jwt_mgr.create_access_token(
        subject=form_data.username)
    jwt_mgr.set_token_cookie(response, access_token)
    return LoginModel(access_token=access_token)


@router.post("/logout")
async def logout(
    request: Request, token: JWT = Depends(jwt_auth_scheme)
) -> None:
    bubbles: Bubbles = request.app.state.bubbles
    rest_api_proxy = bubbles.ctrls.rest_api_proxy
    # Disconnect from the Dashboard REST API.
    assert rest_api_proxy
    rest_api_proxy.disconnect()
    # Append the current token to the deny list.
    deny_list = JWTDenyList(bubbles.mgr)
    deny_list.load()
    deny_list.add(token)
    deny_list.save()
