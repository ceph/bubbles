# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from fastapi import APIRouter, Request
from bubbles.bubbles import Bubbles
from bubbles.backend.models.df import ClusterUsageStatsModel

router = APIRouter(prefix="/cluster", tags=["cluster"])


@router.get("/df", response_model=ClusterUsageStatsModel)
async def get_df(request: Request) -> ClusterUsageStatsModel:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.cluster is not None
    return bubbles.ctrls.cluster.df()
