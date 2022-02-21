# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
#
# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false

from abc import ABC
from mgr_module import HandleCommandResult, MgrModule
from typing import Optional


class BubblesExtra(ABC):
    def start(self, mgr: MgrModule) -> None:
        raise NotImplementedError()

    def shutdown(self) -> None:
        raise NotImplementedError()

    def handle_command(
        self, inbuf: Optional[str], cmd: dict
    ) -> HandleCommandResult:
        raise NotImplementedError()
