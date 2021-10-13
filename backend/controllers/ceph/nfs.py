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
from typing import List

logger = logging.getLogger(__name__)


class Error(Exception):
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


class NFSController:
    cluster: NFSCluster

    def __init__(self, mgr: MgrModule) -> None:
        self.cluster = NFSCluster(mgr)
