# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from fastapi import APIRouter, Depends, Request

from bubbles.bubbles import Bubbles
from bubbles.backend.api import jwt_auth_scheme
from bubbles.backend.models.status import StatusModel

router = APIRouter(prefix="/status", tags=["status"])


@router.get("/", name="Get the status information", response_model=StatusModel)
async def get_status(
    request: Request, _=Depends(jwt_auth_scheme)
) -> StatusModel:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.rest_api_proxy is not None
    return StatusModel(dashboard_url=bubbles.ctrls.rest_api_proxy.base_url)
