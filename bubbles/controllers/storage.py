# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from bubbles.controllers.services import ServicesController
from bubbles.models.df import ClusterUsageStatsModel
from pydantic import BaseModel, Field
from mgr_module import MgrModule
from bubbles.controllers.cluster import ClusterController


class StorageStats(BaseModel):
    total: int = Field(0, title="Total raw storage, bytes")
    available: int = Field(0, title="available storage, bytes")
    allocated: int = Field(0, title="total allocated storage")
    unallocated: int = Field(0, title="unallocated storage, bytes")


class StorageController:
    _mgr: MgrModule
    _cluster: ClusterController
    _services: ServicesController

    def __init__(
        self,
        mgr: MgrModule,
        cluster: ClusterController,
        services: ServicesController,
    ) -> None:
        self._mgr = mgr
        self._cluster = cluster
        self._services = services

    def stats(self) -> StorageStats:
        df: ClusterUsageStatsModel = self._cluster.df()
        avail: int = df.stats.total_avail_bytes
        allocated: int = self._services.total_allocated
        unallocated: int = avail - allocated
        return StorageStats(
            total=df.stats.total_bytes,
            available=avail,
            allocated=allocated,
            unallocated=unallocated,
        )
