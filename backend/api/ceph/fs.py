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
from bubbles.backend.controllers.ceph.fs import Error, NotAuthorized
from bubbles.backend.models.ceph.fs import (
    CephFSAuthorizationModel,
    CephFSListEntryModel,
)
from bubbles.bubbles import Bubbles

router = APIRouter(prefix="/ceph/fs", tags=["ceph"])


class ServiceRequest(BaseModel):
    placement: Optional[str] = "*"


@router.put("/{name}", name="Create a Ceph filesystem")
async def create(
    request: Request,
    name: str,
    req: ServiceRequest,
    _: Callable = Depends(jwt_auth_scheme),
) -> CephFSListEntryModel:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.fs.create(name=name, placement=req.placement)
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/",
    name="Get a list of Ceph filesystems",
    response_model=List[CephFSListEntryModel],
)
async def ls(
    request: Request, _: Callable = Depends(jwt_auth_scheme)
) -> List[CephFSListEntryModel]:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.fs.ls()
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/{name}",
    name="Get detail about a Ceph filesystem",
    response_model=CephFSListEntryModel,
)
async def get(
    request: Request,
    name: str,
    _: Callable = Depends(jwt_auth_scheme),
) -> CephFSListEntryModel:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        for fs in bubbles.ctrls.ceph.fs.ls():
            if fs.name == name:
                return fs
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.put(
    "/{name}/auth",
    name="Create an auth entity to access a Ceph filesystem",
    response_model=CephFSAuthorizationModel,
)
async def auth_put(
    request: Request,
    name: str,
    client_id: Optional[str] = None,
    _: Callable = Depends(jwt_auth_scheme),
) -> CephFSAuthorizationModel:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.fs.set_auth(name, client_id)
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/{name}/auth",
    name="Get detail about an auth entity to access a Ceph filesystem",
    response_model=CephFSAuthorizationModel,
)
async def auth_get(
    request: Request,
    name: str,
    client_id: Optional[str] = None,
    _: Callable = Depends(jwt_auth_scheme),
) -> CephFSAuthorizationModel:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.fs.get_auth(name, client_id)
    except NotAuthorized as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
