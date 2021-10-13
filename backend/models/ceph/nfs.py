# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import List, Optional

from pydantic import BaseModel


class NFSDaemonModel(BaseModel):
    hostname: str
    ip: str
    port: int


class NFSServiceModel(BaseModel):
    name: str
    daemons: List[NFSDaemonModel]


class NFSServiceRequest(BaseModel):
    placement: Optional[str] = "*"
