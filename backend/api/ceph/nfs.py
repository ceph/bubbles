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
    NotFound,
)
from bubbles.backend.models.ceph.nfs import (
    NFSServiceModel,
    NFSServiceRequest,
)

router = APIRouter(prefix="/ceph/nfs", tags=["ceph"])


@router.put(
    "/service/{name}",
    name="create an nfs service",
    response_model=NFSServiceModel,
)
async def service_create(
    request: Request,
    name: str,
    req: NFSServiceRequest,
    _: Callable = Depends(jwt_auth_scheme),
) -> NFSServiceModel:
    bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.nfs.cluster.create(name, placement=req.placement)
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.delete(
    "/service/{name}",
    name="delete an nfs service",
)
async def service_delete(
    request: Request,
    name: str,
    _: Callable = Depends(jwt_auth_scheme),
) -> None:
    bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.nfs.cluster.delete(name)
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


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


@router.get(
    "/service/{name}",
    name="nfs service detail",
    response_model=NFSServiceModel,
)
async def service_get(
    request: Request,
    name: str,
    _: Callable = Depends(jwt_auth_scheme),
) -> NFSServiceModel:
    bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.nfs.cluster.get(name)
    except NotFound as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/export/{service_id}", name="list nfs export ids", response_model=List[int]
)
async def export_ls(
    request: Request,
    service_id: str,
    _: Callable = Depends(jwt_auth_scheme),
) -> List[int]:
    bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.nfs.export.ls(service_id)
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
