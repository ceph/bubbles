# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Any, Dict, List

from pydantic import BaseModel, Field


class OSDPoolEntryModel(BaseModel):
    pool: int
    pool_name: str
    size: int
    min_size: int
    crush_rule: int


class OSDMapModel(BaseModel):
    epoch: int
    num_osds: int
    num_up_osds: int
    osd_up_since: int
    num_in_osds: int
    osd_in_since: int
    num_remapped_pgs: int


class HealthCheckSummaryModel(BaseModel):
    message: str
    count: int


class HealthCheckModel(BaseModel):
    severity: str
    summary: HealthCheckSummaryModel
    muted: bool


class HealthStatusModel(BaseModel):
    status: str
    checks: Dict[str, HealthCheckModel]


class PGStateModel(BaseModel):
    state_name: str
    count: int


class PGMapModel(BaseModel):
    pgs_by_state: List[PGStateModel]
    num_pgs: int = Field(0, title="Number of placement groups")
    num_pools: int = Field(0, title="Number of pools")
    num_objects: int = Field(0, title="Number of objects")
    # storage statistics
    data_bytes: int = Field(0, title="Total data (byte)")
    bytes_used: int = Field(0, title="Used storage (byte)")
    bytes_avail: int = Field(0, title="Available storage (byte)")
    bytes_total: int = Field(0, title="Total storage (byte)")
    # pg statistics
    inactive_pgs_ratio: float = Field(0, title="Ratio of inactive PGs")
    degraded_objects: int = Field(0, title="Number of degraded objects")
    degraded_total: int = Field(0, title="Total number of degraded copies")
    degraded_ratio: float = Field(0, title="Ratio of degraded objects")
    # client io
    read_bytes_sec: int = Field(0, title="Client reads per second (byte)")
    write_bytes_sec: int = Field(0, title="Client writes per second (byte)")
    read_op_per_sec: int = Field(0, title="Client read operations per second")
    write_op_per_sec: int = Field(0, title="Client write operations per second")


class MONMapModel(BaseModel):
    epoch: int
    min_mon_release_name: str
    num_mons: int


class MGRMapModel(BaseModel):
    available: bool
    num_standbys: int
    modules: List[str]
    services: Dict[str, Any]


class ClusterStatusModel(BaseModel):
    fsid: str
    election_epoch: int
    quorum: List[int]
    quorum_names: List[str]
    quorum_age: int
    health: HealthStatusModel
    monmap: MONMapModel
    osdmap: OSDMapModel
    pgmap: PGMapModel
    fsmap: Dict[str, Any]
    mgrmap: MGRMapModel
    servicemap: Dict[str, Any]
    progress_events: Dict[str, Any]


class EventModel(BaseModel):
    ts: int = Field(title="The Unix time stamp")
    severity: str
    message: str
