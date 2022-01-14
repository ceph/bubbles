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
from abc import ABC
from typing import Any, List, Optional

import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from mgr_module import HandleCommandResult, MgrModule, Option
from mgr_util import build_url

import bubbles.extras_loader as extras_loader
from bubbles.backend.api import auth, cluster, host, services, storage, users
from bubbles.backend.api.ceph import fs, nfs, osd
from bubbles.bubbles import Bubbles


class BubblesModule(MgrModule):
    MODULE_OPTIONS: List[Any] = [
        Option(
            "extras_autoreload_enabled",
            type="bool",
            default=False,
            desc="Automatically reload extras on file change",
        )
    ]
    NATIVE_OPTIONS: List[Any] = []
    # NOTE(marcel) Declare a catch all command handled by any Bubbles
    # extra, as we can't declare commands dynamically
    COMMANDS = [
        {
            "cmd": "bubbles-extra",
            "desc": "Do something awesome",
            "perm": "r",
        }
    ]

    app: Optional[FastAPI] = None
    api: Optional[FastAPI] = None

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.extras = extras_loader.discover_extras()
        self.log.info(
            "Extras discovered: %s",
            ", ".join(str(extra) for extra in self.extras),
        )

    async def _startup(self) -> None:
        self.log.info("Startup Bubbles")
        assert self.api
        bubbles = Bubbles(self)
        self.api.state.bubbles = bubbles
        await bubbles.start()
        for extra in self.extras:
            self.log.info("Initialzing %s", extra)
            extra.obj.start(self)
        if self.get_module_option("extras_autoreload_enabled"):
            extras_loader.enable_extras_autoreload(
                self.extras, lambda: [self], self.log
            )

    async def _shutdown(self) -> None:
        self.log.info("Shutting down Bubbles extras")
        for extra in self.extras:
            self.log.info("Initialzing %s", extra)
            extra.obj.shutdown()
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
        self.api.include_router(users.router)
        self.api.include_router(host.router)

        # ceph related endpoints
        self.api.include_router(fs.router)
        self.api.include_router(nfs.router)
        self.api.include_router(osd.router)

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
        self._announce_service(host, port)

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

    def _announce_service(
        self, host: str, port: int, scheme: str = "http"
    ) -> None:
        if host in ["::", "0.0.0.0"]:
            host = self.get_mgr_ip()
        self.set_uri(build_url(host, scheme=scheme, port=port, path="/"))

    def shutdown(self) -> None:
        self.log.info("Shutting down Bubbles server")
        if not self.app:
            return

    def notify(self, notify_type: str, notify_id: str) -> None:
        # self.log.debug(f"recv notify {notify_type}")
        pass

    def handle_command(
        self, inbuf: Optional[str], cmd: dict
    ) -> HandleCommandResult:
        self.log.info("Command incoming: %r", cmd)
        if cmd["prefix"].startswith("bubbles-extra"):
            for extra in self.extras:
                self.log.info("Checking extra handler %s", extra)
                try:
                    extra.obj.handle_command(inbuf, cmd)
                except NotImplementedError:
                    pass
        raise NotImplementedError()


class BubblesExtra(ABC):
    def start(self, mgr: BubblesModule) -> None:
        raise NotImplementedError()

    def shutdown(self) -> None:
        raise NotImplementedError()

    def handle_command(
        self, inbuf: Optional[str], cmd: dict
    ) -> HandleCommandResult:
        raise NotImplementedError()
