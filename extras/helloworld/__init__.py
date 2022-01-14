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

from mgr_module import MgrModule, HandleCommandResult

import json
from fastapi import APIRouter

from bubbles.module import BubblesExtra


class HelloWorldExtra(BubblesExtra):
    def start(self, mgr: MgrModule):
        self.mgr = mgr
        self.mgr.api.include_router(self.make_router())
        self.mgr.log.info("hello world!")

    def make_router(self):
        router = APIRouter(prefix="/hello")

        @router.get("/world", name="Hello World!")
        async def hello_world_handler():
            return {"result": "hello world!"}
        return router

    def shutdown(self):
        self.mgr.log.info("good bye world")

    def handle_command(self, inbuf, cmd):
        if cmd.get("command", None) == "hello":
            return HandleCommandResult(
                0, json.dumps({"result": "hello world!"}), "")
        raise NotImplementedError()


__bubbles_extra_class__ = HelloWorldExtra
