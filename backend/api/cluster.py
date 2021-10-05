# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Callable, List

from fastapi import APIRouter, Depends, Request

from bubbles.bubbles import Bubbles
from bubbles.backend.api import jwt_auth_scheme
from bubbles.backend.models.cluster import ClusterStatusModel, EventModel
from bubbles.backend.models.df import ClusterUsageStatsModel

router = APIRouter(prefix="/cluster", tags=["cluster"])


@router.get("/df", response_model=ClusterUsageStatsModel)
async def get_df(
    request: Request, _: Callable = Depends(jwt_auth_scheme)
) -> ClusterUsageStatsModel:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.cluster is not None
    return bubbles.ctrls.cluster.df()


@router.get(
    "/status",
    name="Get the cluster status information",
    response_model=ClusterStatusModel,
)
async def get_status(
    request: Request, _: Callable = Depends(jwt_auth_scheme)
) -> ClusterStatusModel:
    bubbles: Bubbles = request.app.state.bubbles
    assert bubbles.ctrls.cluster is not None
    return bubbles.ctrls.cluster.status()


@router.get("/events", response_model=List[EventModel])
async def get_events(
    request: Request, _: Callable = Depends(jwt_auth_scheme)
) -> List[EventModel]:
    # ToDo: Replace mocked data by live data.
    events = [
        {
            "ts": 1633362463,
            "severity": "info",
            "message": "fooo bar asdasdlkasjd aksdjlas dasjdlsakjd asdkasld asdas.",
        },
        {
            "ts": 1633363417,
            "severity": "warn",
            "message": "Lorem ipsum dolor sit amet, sed diam voluptua.",
        },
    ]
    return [EventModel.parse_obj(event) for event in events]
