# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import List, Optional

from mgr_module import MgrModule
from pydantic import BaseModel, Field


class UsageStatsModel(BaseModel):
    total_bytes: int = Field(0, title="total bytes")
    total_avail_bytes: int = Field(0, title="total available bytes")
    total_used_bytes: int = Field(0, title="total used bytes")
    total_used_raw_bytes: int = Field(0, title="total used raw bytes")
    total_used_raw_ratio: float = Field(0.0, title="total used raw ratio")


class GlobalUsageStatsModel(UsageStatsModel):
    num_osds: int = Field(0, title="number of osds in the cluster")
    num_per_pool_osds: int = Field(0, title="??")
    num_per_pool_omap_osds: int = Field(0, title="??")


class UsageStatsByClass(BaseModel):
    ssd: Optional[UsageStatsModel] = Field(None, title="ssd stats")
    hdd: Optional[UsageStatsModel] = Field(None, title="hdd stats")


class PoolStatsModel(BaseModel):
    stored: int = Field(0, title="total user usage, bytes")
    stored_data: int = Field(0, title="user data, bytes")
    stored_omap: int = Field(0, title="user omap data, bytes")
    stored_raw: int = Field(0, title="user data, raw, bytes")
    objects: int = Field(0, title="number of objects in pool")
    kb_used: int = Field(0, title="real used storage, kbytes")
    bytes_used: int = Field(0, title="real used storage, bytes")
    data_bytes_used: int = Field(0, title="real data used, bytes")
    omap_bytes_used: int = Field(0, title="real omap used, bytes")
    percent_used: float = Field(0, title="real used percentage")
    max_avail: int = Field(0, title="maximum available bytes for usage")
    avail_raw: int = Field(0, title="maximum raw available bytes")
    quota_objects: int = Field(0, title="defined quota objects")
    quota_bytes: int = Field(0, title="defined quota bytes")
    dirty: int = Field(0, title="number of dirty objects")
    rd: int = Field(0, title="number of reads")
    wr: int = Field(0, title="number of writes")
    rd_bytes: int = Field(0, title="total read bytes")
    wr_bytes: int = Field(0, title="total write bytes")
    compress_bytes_used: int = Field(0, title="allocated compressed data bytes")
    compress_unded_bytes: int = Field(0, title="compressed data original bytes")


class PoolStatsEntryModel(BaseModel):
    name: str = Field("", title="pool name")
    id: int = Field(0, title="pool id")
    stats: PoolStatsModel


# implements model for `df`
class ClusterUsageStatsModel(BaseModel):
    stats: GlobalUsageStatsModel
    stats_by_class: UsageStatsByClass
    pools: List[PoolStatsModel]

    @staticmethod
    def get(mgr):  # type: (MgrModule) -> ClusterUsageStatsModel
        return ClusterUsageStatsModel.parse_obj(mgr.get("df"))
