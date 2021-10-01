# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Callable, Dict

from fastapi import APIRouter, Depends, Request, HTTPException, status

from bubbles.bubbles import Bubbles
from bubbles.backend.api import jwt_auth_scheme
from bubbles.backend.controllers.services import ServiceNotFoundError
from bubbles.backend.models.service import (
    ServiceInfoModel,
    ServiceStatusModel,
    ServicesModel,
)

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/", response_model=ServicesModel)
async def list_services(
    request: Request, _: Callable = Depends(jwt_auth_scheme)
) -> ServicesModel:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.services is not None

    allocated = bubbles.ctrls.services.total_allocated
    svcs = bubbles.ctrls.services.services

    status: Dict[str, ServiceStatusModel] = {}
    for svc in svcs:
        status[svc.name] = await bubbles.ctrls.services.status(svc.name)

    return ServicesModel(allocated=allocated, services=svcs, status=status)


@router.post("/create", response_model=bool)
async def create_service(
    request: Request,
    info: ServiceInfoModel,
    _: Callable = Depends(jwt_auth_scheme)
) -> bool:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.services is not None
    return await bubbles.ctrls.services.create(info)


@router.delete("/{name}", name="Delete a service by name")
async def delete_service(
    name: str,
    request: Request,
    _: Callable = Depends(jwt_auth_scheme)
) -> None:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.services is not None
    return await bubbles.ctrls.services.delete(name)


@router.get("/{name}", name="Get a service by name",
            response_model=ServiceInfoModel)
async def get_service(
    name: str,
    request: Request,
    _: Callable = Depends(jwt_auth_scheme)
) -> ServiceInfoModel:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.services is not None
    try:
        service_info = await bubbles.ctrls.services.get(name)
    except ServiceNotFoundError:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, detail="Service does not exist"
        )
    return service_info
