# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Callable, List

from fastapi import APIRouter, Depends, HTTPException, Request, status

from bubbles.bubbles import Bubbles
from bubbles.backend.api import jwt_auth_scheme
from bubbles.backend.controllers.ceph.fs import (
    Error,
)
from bubbles.backend.models.ceph.fs import (
    CephFSListEntryModel,
)

router = APIRouter(prefix="/ceph/fs", tags=["ceph"])


@router.get(
    "/",
    name="Get a list of Ceph filesystems",
    response_model=List[CephFSListEntryModel],
)
async def ls(
    request: Request, _: Callable = Depends(jwt_auth_scheme)
) -> List[CephFSListEntryModel]:
    bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.cephfs.ls()
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
    bubbles = request.app.state.bubbles
    try:
        for fs in bubbles.ctrls.cephfs.ls():
            if fs.name == name:
                return fs
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
