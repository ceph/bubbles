# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from mgr_module import MgrModule
from typing import Dict, List

from bubbles.backend.errors import BubblesError
from bubbles.backend.models.service import (
    ServiceBackendEnum,
    ServiceInfoModel,
    ServiceModel,
    ServiceStateModel,
    ServiceStatusCodeEnum,
    ServiceStatusEnum,
    ServiceStatusInfo,
    ServiceStatusModel,
    ServiceTypeEnum,
)


class ServiceError(BubblesError):
    pass


class ServiceNotFoundError(ServiceError):
    pass


class ServicesController:

    _mgr: MgrModule
    _services: Dict[str, ServiceModel] = {}

    def __init__(self, mgr: MgrModule):
        self._mgr = mgr
        self._load()

    @property
    def services(self) -> List[ServiceInfoModel]:
        return [svc.info for svc in self._services.values()]

    async def get(self, name: str) -> ServiceInfoModel:
        if name not in self._services:
            raise ServiceNotFoundError()
        return self._services[name].info

    @property
    def total_allocated(self) -> int:
        allocated = sum([svc.raw_size for svc in self._services.values()])
        return allocated

    async def create(self, info: ServiceInfoModel) -> bool:
        if not self.is_valid(info):
            return False

        if info.name in self._services:
            return False

        self._services[info.name] = ServiceModel(info=info, pools=[])
        self._save()
        return True

    async def delete(self, name: str) -> None:
        try:
            self._services.pop(name)
        except KeyError:
            raise ServiceNotFoundError()
        self._save()

    async def status(self, name: str) -> ServiceStatusModel:
        status = ServiceStatusModel(
            name=name, status=ServiceStatusEnum.NONE, info=[]
        )
        if name not in self._services:
            status.status = ServiceStatusEnum.ERROR
            status.info.append(
                ServiceStatusInfo(
                    code=ServiceStatusCodeEnum.DNE, msg="does not exist"
                )
            )
            return status
        return status

    def is_valid(self, info: ServiceInfoModel) -> bool:
        return (
            len(info.name) > 0
            and len(info.type) > 0
            and len(info.backend) > 0
            and info.size > 0
            and info.replicas > 0
            and self._is_valid_type(info.type, info.backend)
        )

    def _is_valid_type(
        self, type: ServiceTypeEnum, backend: ServiceBackendEnum
    ) -> bool:

        if type == ServiceTypeEnum.FILE:
            return (
                backend == ServiceBackendEnum.CEPHFS
                or backend == ServiceBackendEnum.NFS
            )
        elif type == ServiceTypeEnum.OBJECT:
            return backend == ServiceBackendEnum.RGW
        else:
            assert type == ServiceTypeEnum.BLOCK
            return (
                backend == ServiceBackendEnum.RBD
                or backend == ServiceBackendEnum.ISCSI
            )

    def _save(self) -> None:
        state = ServiceStateModel(services=self._services)
        svcstr = state.json()
        self._mgr.set_store("services", svcstr)

    def _load(self) -> None:
        svcstr = self._mgr.get_store("services")
        if not svcstr or len(svcstr) == 0:
            return
        state = ServiceStateModel.parse_raw(svcstr)
        self._services = state.services
