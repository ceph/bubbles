# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Callable, Dict

from fastapi import APIRouter, Depends, Request

from bubbles.bubbles import Bubbles
from bubbles.backend.api import jwt_auth_scheme
from bubbles.backend.models.service import (
    ServiceInfoModel,
    ServiceStatusModel,
    ServicesModel,
)

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/", response_model=ServicesModel)
async def get_list(
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
async def create(
    request: Request,
    info: ServiceInfoModel,
    _: Callable = Depends(jwt_auth_scheme),
) -> bool:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.services is not None
    return await bubbles.ctrls.services.create(info)
