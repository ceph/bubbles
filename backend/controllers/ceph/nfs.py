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
from pydantic.tools import parse_obj_as
from typing import List, Optional

from bubbles.backend.models.ceph.nfs import (
    NFSDaemonModel,
    NFSServiceModel,
)

logger = logging.getLogger(__name__)


class Error(Exception):
    pass


class NotFound(Error):
    pass


class NFSCluster:
    _mgr: MgrModule

    def __init__(self, mgr: MgrModule) -> None:
        self._mgr = mgr

    def ls(self) -> List[str]:
        try:
            _, out, _ = self._mgr.check_mon_command(
                {
                    "prefix": "nfs cluster ls",
                }
            )
        except MonCommandFailed as e:
            raise Error(e)

        # TODO: fix `nfs cluster ls` to return json formatting
        return out.split() if out else []

    def _info(self, name: Optional[str] = None) -> List[NFSServiceModel]:
        cmd = {
            "prefix": "nfs cluster info",
            "format": "json",
        }
        if name:
            cmd["cluster_id"] = name

        _, out, _ = self._mgr.check_mon_command(cmd)
        services = json.loads(out)

        ret: List[NFSServiceModel] = []
        for k, v in services.items():
            daemons = parse_obj_as(List[NFSDaemonModel], v["backend"])
            ret.append(NFSServiceModel(name=name, daemons=daemons))
        return ret

    def get(self, name: str) -> NFSServiceModel:
        for svc in self._info(name=name):
            if name == svc.name:
                return svc
            assert False
        raise NotFound(f"unknown nfs service name: {name}")


class NFSController:
    cluster: NFSCluster

    def __init__(self, mgr: MgrModule) -> None:
        self.cluster = NFSCluster(mgr)
