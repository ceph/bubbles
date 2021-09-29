# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
import asyncio
from typing import Optional
from mgr_module import MgrModule

from bubbles.config import Config
from bubbles.controllers.ctrls import Controllers


class Bubbles:
    _task = None  # type: Optional[asyncio.Task[None]]
    _running: bool = False
    _mgr: MgrModule
    _ctrls: Controllers

    def __init__(self, mgr: MgrModule) -> None:
        self._mgr = mgr
        self._ctrls = Controllers(mgr)
        self._config = Config(mgr)

    async def _tick(self) -> None:
        while self._running:
            await asyncio.sleep(1.0)

    async def start(self) -> None:
        self._running = True
        self._ctrls.start()
        self._task = asyncio.create_task(self._tick())

    async def shutdown(self) -> None:
        self._running = False
        if self._task:
            await self._task

    @property
    def ctrls(self) -> Controllers:
        return self._ctrls

    @property
    def mgr(self) -> MgrModule:
        return self._mgr

    @property
    def config(self) -> Config:
        return self._config
