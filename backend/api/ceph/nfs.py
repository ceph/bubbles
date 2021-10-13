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
from bubbles.backend.controllers.ceph.nfs import (
    Error,
)

router = APIRouter(prefix="/ceph/nfs", tags=["ceph"])


@router.get(
    "/service",
    name="list nfs service names",
    response_model=List[str],
)
async def service_ls(
    request: Request, _: Callable = Depends(jwt_auth_scheme)
) -> List[str]:
    bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.nfs.cluster.ls()
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
