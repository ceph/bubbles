# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
import json
import logging
from typing import Any, Dict, List, Union

from mgr_module import MgrModule, MonCommandFailed

from bubbles.backend.models.ceph.osd import OSDMapModel, PoolModel, PoolRequest

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

    def _pool_set(
        self,
        pool: str,
        var: str,
        val: Any,
        really: bool = False,
    ) -> None:
        """Set given pool's configuration variable to a provided value"""
        cmd: Dict[str, Union[str, bool]] = {
            "prefix": "osd pool set",
            "pool": pool,
            "var": var,
            "val": str(val),
        }
        if really:
            cmd["yes_i_really_mean_it"] = True

        try:
            self._mgr.check_mon_command(cmd)
        except MonCommandFailed as e:
            msg = f"unable to set {var} = {val} on pool {pool}: {e}"
            raise Error(msg)

    def set_pool(
        self,
        pool: str,
        req: PoolRequest,
        really: bool = False,
    ) -> PoolModel:
        self._mgr.create_pool(pool)
        for k, v in req:
            self._pool_set(pool, k, v, really=really)
        return self.get_pool(pool)

    def set_pool_size(self, pool: str, size: int) -> None:
        """
        Set a given pool's size to the provided value.
        If the provided value is greater than 2, sets min_size to 2; otherwise
        sets min_size to 1.
        """
        really = True if size == 1 else False
        try:
            self._pool_set(pool, "size", size, really=really)
        except Error as e:
            logger.error(f"mon > unable to set pool size: {e}")

        minsize = 2 if size > 2 else 1
        try:
            self._pool_set(pool, "min_size", minsize)
        except Error as e:
            logger.error(f"mon > unable to set pool min_size: {e}")
