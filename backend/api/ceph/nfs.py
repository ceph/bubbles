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

from bubbles.backend.api import jwt_auth_scheme
from bubbles.backend.controllers.ceph.nfs import Error, NotFound
from bubbles.backend.models.ceph.nfs import (
    CephFSExportRequest,
    NFSExportModel,
    NFSServiceModel,
    NFSServiceRequest,
)
from bubbles.bubbles import Bubbles

router = APIRouter(prefix="/ceph/nfs", tags=["ceph"])


@router.put(
    "/service/{name}",
    name="Create an NFS service",
    response_model=NFSServiceModel,
)
async def service_create(
    request: Request,
    name: str,
    req: NFSServiceRequest,
    _: Callable = Depends(jwt_auth_scheme),
) -> NFSServiceModel:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.nfs.cluster.create(
            name, placement=req.placement
        )
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.delete(
    "/service/{name}",
    name="Delete an NFS service",
)
async def service_delete(
    request: Request,
    name: str,
    _: Callable = Depends(jwt_auth_scheme),
) -> None:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.nfs.cluster.delete(name)
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/service",
    name="List NFS services by name",
    response_model=List[str],
)
async def service_ls(
    request: Request, _: Callable = Depends(jwt_auth_scheme)
) -> List[str]:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.nfs.cluster.ls()
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/service/{name}",
    name="NFS service detail",
    response_model=NFSServiceModel,
)
async def service_get(
    request: Request,
    name: str,
    _: Callable = Depends(jwt_auth_scheme),
) -> NFSServiceModel:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.nfs.cluster.get(name)
    except NotFound as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post(
    "/export/{service_id}",
    name="Create an NFS export",
    response_model=NFSExportModel,
)
async def export_create(
    request: Request,
    service_id: str,
    req: CephFSExportRequest,
    _: Callable = Depends(jwt_auth_scheme),
) -> NFSExportModel:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.nfs.export.create(
            service_id=service_id,
            req=req,
        )
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.delete(
    "/export/{service_id}/{export_id}",
    name="Delete an NFS export",
)
async def export_delete(
    request: Request,
    service_id: str,
    export_id: int,
    _: Callable = Depends(jwt_auth_scheme),
) -> None:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.nfs.export.delete(service_id, export_id)
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/export/{service_id}",
    name="List NFS exports by ID",
    response_model=List[int],
)
async def export_ls(
    request: Request,
    service_id: str,
    _: Callable = Depends(jwt_auth_scheme),
) -> List[int]:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.nfs.export.ls(service_id)
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/export/{service_id}/{export_id}",
    name="NFS export detail",
    response_model=NFSExportModel,
)
async def export_get(
    request: Request,
    service_id: str,
    export_id: int,
    _: Callable = Depends(jwt_auth_scheme),
) -> NFSExportModel:
    bubbles: Bubbles = request.app.state.bubbles
    try:
        return bubbles.ctrls.ceph.nfs.export.get(service_id, export_id)
    except NotFound as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e))
    except Error as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
