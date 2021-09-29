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
from bubbles.api import jwt_auth_scheme
from bubbles.controllers.storage import StorageStats

router = APIRouter(prefix="/storage", tags=["storage"])


@router.get("/stats", response_model=StorageStats)
async def get_stats(
    request: Request, _: Callable = Depends(jwt_auth_scheme)
) -> StorageStats:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.storage is not None
    return bubbles.ctrls.storage.stats()
