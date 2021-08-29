# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from enum import Enum
from typing import Dict
from pydantic import BaseModel
from bubbles.backend.errors import BubblesError


class ServiceError(BubblesError):
    pass


class ServiceNotFoundError(ServiceError):
    pass


class ServiceTypeEnum(str, Enum):
    FILE = "file"
    OBJECT = "object"
    BLOCK = "block"


class ServiceBackendEnum(str, Enum):
    CEPHFS = "cephfs"
    NFS = "nfs"
    RBD = "rbd"
    ISCSI = "iscsi"
    RGW = "rgw"


class ServiceInfoModel(BaseModel):
    name: str
    size: int
    replicas: int
    type: ServiceTypeEnum
    backend: ServiceBackendEnum


class ServicesController:

    _services: Dict[str, ServiceInfoModel] = {}

    def __init__(self):
        pass

    @property
    def services(self) -> Dict[str, ServiceInfoModel]:
        return self._services

    def get(self, name: str) -> ServiceInfoModel:
        if name not in self._services:
            raise ServiceNotFoundError()
        return self._services[name]

    async def create(self, info: ServiceInfoModel) -> bool:
        if not self.is_valid(info):
            return False

        if info.name in self._services:
            return False

        self._services[info.name] = info
        return True

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
