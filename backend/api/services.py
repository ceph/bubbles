# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import List
from fastapi import APIRouter, Request
from bubbles.backend.controllers.services import ServiceInfoModel


router = APIRouter(prefix="/services", tags=["services"])


@router.get("/list", response_model=List[ServiceInfoModel])
async def get_list(request: Request) -> List[ServiceInfoModel]:
    return [
        ServiceInfoModel(
            name="foo",
            size=10000000,
            replicas=2,
            type="cephfs",
            backend="nfs"
        )
    ]

@router.post("/create", response_model=bool)
async def create(request: Request, info: ServiceInfoModel) -> bool:
    return True
