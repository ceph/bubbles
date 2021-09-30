# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Callable

from fastapi import APIRouter, Depends, Request

from bubbles.bubbles import Bubbles
from bubbles.backend.api import jwt_auth_scheme
from bubbles.backend.models.storage import StorageStatsModel

router = APIRouter(prefix="/storage", tags=["storage"])


@router.get("/stats", response_model=StorageStatsModel)
async def get_stats(
    request: Request, _: Callable = Depends(jwt_auth_scheme)
) -> StorageStatsModel:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.storage is not None
    return bubbles.ctrls.storage.stats()
