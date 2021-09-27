# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import List

from pydantic import BaseModel, Field


class ServiceModel(BaseModel):
    type: str = Field(title="Type of service")
    id: str = Field(title="Service identifier")


class HostModel(BaseModel):
    hostname: str = Field(title="Hostname")
    services: List[ServiceModel] = Field(title="Services related to the host")
    ceph_version: str = Field(title="Ceph version")
    addr: str = Field(title="Host address")
    labels: List[str] = Field(title="Labels related to the host")
    service_type: str = Field(title="")
    status: str = Field(title="The status of the host")
