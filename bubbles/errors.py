# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import Optional


class BubblesError(Exception):
    _msg: Optional[str] = None

    def __init__(self, msg: Optional[str] = None) -> None:
        super().__init__()
        self._msg = msg

    @property
    def message(self) -> str:
        return self._msg if self._msg else "bubbles error"
