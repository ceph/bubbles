# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from pydantic import BaseModel, Field


class StorageStatsModel(BaseModel):
    total: int = Field(0, title="Total raw storage, bytes")
    available: int = Field(0, title="available storage, bytes")
    allocated: int = Field(0, title="total allocated storage")
    unallocated: int = Field(0, title="unallocated storage, bytes")
