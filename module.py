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

import asyncio
import os
import sys
import uvicorn

from typing import Any, Optional, List
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from mgr_module import MgrModule
from bubbles.bubbles import Bubbles
from bubbles.backend.api import (
    auth,
    cluster,
    host,
    services,
    status,
    storage,
    user
)


class BubblesModule(MgrModule):
    MODULE_OPTIONS: List[Any] = []
    NATIVE_OPTIONS: List[Any] = []

    app: Optional[FastAPI] = None
    api: Optional[FastAPI] = None

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)

    async def _startup(self) -> None:
        self.log.info("Startup Bubbles")
        assert self.api
        bubbles = Bubbles(self)
        self.api.state.bubbles = bubbles
        await bubbles.start()

    async def _shutdown(self) -> None:
        self.log.info("Shutdown Bubbles")
        assert self.api
        bubbles: Bubbles = self.api.state.bubbles
        await bubbles.shutdown()

    def serve(self) -> None:
        self.log.info("Starting Bubbles server")
        self.app = FastAPI(docs_url=None)
        self.api = FastAPI(
            title="Bubbles is a simplified management UI for Ceph"
        )
        self.app.add_event_handler("startup", self._startup)
        self.app.add_event_handler("shutdown", self._shutdown)

        self.api.include_router(services.router)
        self.api.include_router(cluster.router)
        self.api.include_router(storage.router)
        self.api.include_router(auth.router)
        self.api.include_router(user.router)
        self.api.include_router(status.router)
        self.api.include_router(host.router)

        staticdir = os.path.join(
            os.path.dirname(os.path.realpath(__file__)), "frontend/dist"
        )

        self.app.mount("/api", self.api, name="api")
        self.app.mount(
            "/", StaticFiles(directory=staticdir, html=True), name="static"
        )
        self._run()

    def _run(
        self,
        host: str = "0.0.0.0",
        port: int = 1337,
    ) -> None:
        config = uvicorn.Config(app=self.app, host=host, port=port)
        config.setup_event_loop()
        server = uvicorn.Server(config=config)

        if sys.version_info >= (3, 7):
            return asyncio.run(server.serve())

        loop = asyncio.new_event_loop()
        try:
            loop.run_until_complete(server.serve())
        finally:
            loop.close()

    def shutdown(self) -> None:
        self.log.info("Shutting down Bubbles server")
        if not self.app:
            return

    def notify(self, notify_type: str, notify_id: str) -> None:
        # self.log.debug(f"recv notify {notify_type}")
        pass
