# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
import json
import logging
from typing import List, NewType, Optional

from mgr_module import MgrModule, MonCommandFailed
from pydantic.tools import parse_obj_as

from bubbles.backend.models.ceph.fs import (
    CephFSAuthorizationModel,
    CephFSListEntryModel,
)

logger = logging.getLogger(__name__)

AuthEntity = NewType("AuthEntity", str)


class Error(Exception):
    pass


class NotAuthorized(Error):
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
        raise NotFound(f"Unknown file system: {fs.name}")

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

    def _get_auth_entity(
        self,
        fsname: str,
        clientid: Optional[str] = None,
    ) -> AuthEntity:
        if not clientid:
            clientid = "bubbles"
        return AuthEntity(f"client.{fsname}.{clientid}")

    def set_auth(
        self,
        fsname: str,
        clientid: Optional[str] = None,
    ) -> CephFSAuthorizationModel:
        try:
            _, out, _ = self._mgr.check_mon_command(
                {
                    "prefix": "fs authorize",
                    "filesystem": fsname,
                    "entity": self._get_auth_entity(fsname, clientid),
                    "caps": ["/", "rw"],
                    "format": "json",
                }
            )
        except MonCommandFailed as e:
            raise Error(e)

        return parse_obj_as(List[CephFSAuthorizationModel], json.loads(out))[0]

    def get_auth(
        self,
        fsname: str,
        clientid: Optional[str] = None,
    ) -> CephFSAuthorizationModel:
        try:
            _, out, _ = self._mgr.check_mon_command(
                {
                    "prefix": "auth get",
                    "entity": self._get_auth_entity(fsname, clientid),
                    "format": "json",
                }
            )
        except MonCommandFailed as e:
            # TODO: ..
            # if e.rc == errno.ENOENT:
            #    raise NotAuthorized(e.message)
            raise NotAuthorized(e)

        return parse_obj_as(List[CephFSAuthorizationModel], json.loads(out))[0]
