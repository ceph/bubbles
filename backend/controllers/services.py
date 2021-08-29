# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Dict
from pydantic import BaseModel
from bubbles.backend.errors import BubblesError


class ServiceError(BubblesError):
    pass


class ServiceNotFoundError(ServiceError):
    pass


class ServiceInfoModel(BaseModel):
    name: str
    size: int
    replicas: int
    type: str
    backend: str


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
            len(info.name) > 0 and len(info.type) > 0 and
            len(info.backend) > 0 and info.size > 0 and info.replicas > 0 and
            self._is_valid_type(info.type, info.backend)
        )

    def _is_valid_type(self, type: str, backend: str) -> bool:
        type = type.lower()
        backend = backend.lower()
        if type not in [ "file", "object", "block" ]:
            return False

        if type == "file":
            return backend in [ "cephfs", "nfs" ]
        elif type == "object":
            return backend == "rgw"
        else:
            return backend in [ "rbd", "iscsi" ]
