# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Callable

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from bubbles.bubbles import Bubbles
from bubbles.backend.api import jwt_auth_scheme
from bubbles.backend.controllers.ceph.osd import (
    Error,
)
from bubbles.backend.models.ceph.osd import (
    OSDMapModel,
)

router = APIRouter(prefix="/ceph/osd", tags=["ceph"])


@router.get(
    "/dump",
    name="Get an OSD Map",
    response_model=OSDMapModel,
)
async def dump(
    request: Request,
    _: Callable = Depends(jwt_auth_scheme),
) -> OSDMapModel:
    bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.osd.dump()
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
