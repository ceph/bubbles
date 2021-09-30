# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import List

from pydantic import BaseModel


class CephFSListEntryModel(BaseModel):
    name: str
    metadata_pool: str
    metadata_pool_id: int
    data_pool_ids: List[int]
    data_pools: List[str]
