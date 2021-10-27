# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Callable, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from bubbles.backend.api import jwt_auth_scheme
from bubbles.backend.controllers.ceph.osd import Error, NotFound
from bubbles.backend.models.ceph.osd import OSDMapModel, PoolModel, PoolRequest
from bubbles.bubbles import Bubbles

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
        return bubbles.ctrls.ceph.osd.dump()
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/pool",
    name="Get a list of all OSD names",
    response_model=List[str],
)
async def pool_ls(
    request: Request,
    _: Callable = Depends(jwt_auth_scheme),
) -> List[str]:
    bubbles = request.app.state.bubbles
    try:
        return [p.pool_name for p in bubbles.ctrls.ceph.osd.get_pools()]
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/pool/{name}",
    name="Get an OSD pool",
    response_model=PoolModel,
)
async def get_pool(
    request: Request,
    name: str,
    _: Callable = Depends(jwt_auth_scheme),
) -> PoolModel:
    bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.osd.get_pool(name)
    except NotFound as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.put(
    "/pool/{name}",
    name="Create an OSD pool",
    response_model=PoolModel,
)
async def set_pool(
    request: Request,
    name: str,
    req: PoolRequest,
    yes_i_really_mean_it: bool = False,
    _: Callable = Depends(jwt_auth_scheme),
) -> PoolModel:
    bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.osd.set_pool(
            name, req, really=yes_i_really_mean_it
        )
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
