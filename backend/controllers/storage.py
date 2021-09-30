# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from mgr_module import MgrModule

from bubbles.backend.controllers.services import ServicesController
from bubbles.backend.models.df import ClusterUsageStatsModel
from bubbles.backend.models.storage import StorageStatsModel
from bubbles.backend.controllers.cluster import ClusterController


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

    def stats(self) -> StorageStatsModel:
        df: ClusterUsageStatsModel = self._cluster.df()
        avail: int = df.stats.total_avail_bytes
        allocated: int = self._services.total_allocated
        unallocated: int = avail - allocated
        return StorageStatsModel(
            total=df.stats.total_bytes,
            available=avail,
            allocated=allocated,
            unallocated=unallocated,
        )
