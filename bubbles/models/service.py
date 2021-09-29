# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from enum import Enum
from typing import Dict, List

from pydantic import BaseModel, Field


class ServiceStatusEnum(int, Enum):
    OKAY = 0
    WARN = 5
    ERROR = 10
    NONE = 20


class ServiceStatusCodeEnum(str, Enum):
    UNDEFINED = "undefined"
    DNE = "dne"


class ServiceStatusInfo(BaseModel):
    code: ServiceStatusCodeEnum
    msg: str


class ServiceStatusModel(BaseModel):
    name: str
    status: ServiceStatusEnum
    info: List[ServiceStatusInfo]


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

    @property
    def raw_size(self) -> int:
        return self.replicas * self.size


class ServiceModel(BaseModel):
    info: ServiceInfoModel
    pools: List[int]

    @property
    def name(self) -> str:
        return self.info.name

    @property
    def size(self) -> int:
        return self.info.size

    @property
    def raw_size(self) -> int:
        return self.info.raw_size

    @property
    def type(self) -> ServiceTypeEnum:
        return self.info.type

    @property
    def backend(self) -> ServiceBackendEnum:
        return self.info.backend


class ServiceStateModel(BaseModel):
    services: Dict[str, ServiceModel]


class ServicesModel(BaseModel):
    allocated: int = Field(0, title="Allocated bytes, total")
    services: List[ServiceInfoModel] = Field([], title="Services")
    status: Dict[str, ServiceStatusModel] = Field(
        {}, title="status per service"
    )
