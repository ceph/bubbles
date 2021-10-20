# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
import json
import logging
from typing import List, Optional

from mgr_module import MgrModule, MonCommandFailed
from pydantic.tools import parse_obj_as

from bubbles.backend.models.ceph.nfs import (
    CephFSExportRequest,
    NFSBackingStoreEnum,
    NFSDaemonModel,
    NFSExportModel,
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

    def create(self, name: str, placement: Optional[str]) -> NFSServiceModel:
        cmd = {
            "prefix": "nfs cluster create",
            "cluster_id": name,
        }
        if placement:
            cmd["placement"] = placement

        _, out, _ = self._mgr.check_mon_command(cmd)

        return self.get(name)

    def delete(self, name: str) -> None:
        try:
            _, _, _ = self._mgr.check_mon_command(
                {
                    "prefix": "nfs cluster delete",
                    "cluster_id": name,
                }
            )
        except MonCommandFailed as e:
            raise Error(e)

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


class NFSExport:
    _mgr: MgrModule

    def __init__(self, mgr: MgrModule) -> None:
        self._mgr = mgr

    def create(
        self,
        service_id: str,
        req: CephFSExportRequest,
    ) -> NFSExportModel:
        # TODO: fixup for `rgw`
        cmd = {
            "prefix": f"nfs export create {req.backing}",
            "cluster_id": service_id,
            "fsname": req.fs_name,
            "pseudo_path": req.pseudo_path,
            "readonly": req.readonly,
        }
        if req.fs_path:
            cmd["path"] = req.fs_path
        if req.squash:
            cmd["squash"] = req.squash
        if req.client_addr:
            cmd["client_addr"] = req.client_addr

        try:
            _, out, _ = self._mgr.check_mon_command(cmd)
        except MonCommandFailed as e:
            raise Error(e)

        # find the newly created export
        for export in self._ls(service_id, detail=True):
            if req.pseudo_path == export.pseudo:
                return export
        raise Error(f"failed to create nfs export")

    def delete(self, service_id: str, export_id: int) -> None:
        export = self.get(service_id, export_id)
        try:
            _, out, _ = self._mgr.check_mon_command(
                {
                    "prefix": "nfs export delete",
                    "cluster_id": service_id,
                    "pseudo_path": export.pseudo,
                }
            )
        except MonCommandFailed as e:
            raise Error(e)

    def _ls(
        self, service_id: str, detail: bool = False
    ) -> List[NFSExportModel]:
        try:
            _, out, _ = self._mgr.check_mon_command(
                {
                    "prefix": "nfs export ls",
                    "cluster_id": service_id,
                    "detailed": detail,  # TODO: `detailed` -> `detail`?
                    "format": "json",
                }
            )
        except MonCommandFailed as e:
            raise Error(e)

        ret: List[NFSExportModel] = []
        if out:
            for export in json.loads(out):
                ret.append(NFSExportModel(**export))
        return ret

    def ls(self, service_id: str) -> List[int]:
        return sorted([e.export_id for e in self._ls(service_id, detail=True)])

    def get(self, service_id: str, export_id: int) -> NFSExportModel:
        for export in self._ls(service_id, detail=True):
            if export_id == export.export_id:
                return export
        raise NotFound(
            f"nfs export {export_id} not found in nfs cluster {service_id}"
        )


class NFSController:
    cluster: NFSCluster
    export: NFSExport

    def __init__(self, mgr: MgrModule) -> None:
        self.cluster = NFSCluster(mgr)
        self.export = NFSExport(mgr)
