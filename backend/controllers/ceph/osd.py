# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
import json
import logging
from mgr_module import MgrModule, MonCommandFailed
from typing import Dict, List, Union

from bubbles.backend.models.ceph.osd import (
    OSDMapModel,
    PoolModel,
)

logger = logging.getLogger(__name__)


class Error(Exception):
    pass


class NotFound(Error):
    pass


class OSD:
    _mgr: MgrModule

    def __init__(self, mgr: MgrModule) -> None:
        self._mgr = mgr

    def dump(self) -> OSDMapModel:
        osdmap = self._mgr.get_osdmap()
        return OSDMapModel.parse_obj(osdmap.dump())

    def get_pools(self) -> List[PoolModel]:
        return self.dump().pools

    def get_pool(self, name: str) -> PoolModel:
        for pool in self.get_pools():
            if pool.pool_name == name:
                return pool
        raise NotFound(f"unknown pool: {name}")
