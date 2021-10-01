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

from bubbles.backend.models.ceph.fs import (
    CephFSListEntryModel,
)

logger = logging.getLogger(__name__)


class Error(Exception):
    pass


class NotFound(Error):
    pass


class CephFSController:
    _mgr: MgrModule

    def __init__(self, mgr: MgrModule) -> None:
        self._mgr = mgr

    def create(
        self, name: str, placement: Optional[str] = None
    ) -> CephFSListEntryModel:
        cmd = {
            "prefix": "fs volume create",
            "name": name,
        }
        if placement:
            cmd["placement"] = placement

        try:
            _, out, _ = self._mgr.check_mon_command(cmd)
        except MonCommandFailed as e:
            raise Error(e)

        for fs in self.ls():
            if name == fs.name:
                return fs
        raise NotFound(f"unknown fs: {fs.name}")

    def ls(self) -> List[CephFSListEntryModel]:
        try:
            _, out, _ = self._mgr.check_mon_command(
                {
                    "prefix": "fs ls",
                    "format": "json",
                }
            )
        except MonCommandFailed as e:
            raise Error(e)

        return parse_obj_as(List[CephFSListEntryModel], json.loads(out))
