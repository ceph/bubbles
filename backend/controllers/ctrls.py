# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#

from bubbles.backend.controllers.storage import StorageController
from mgr_module import MgrModule
from typing import Optional
from bubbles.backend.controllers.cluster import ClusterController
from bubbles.backend.controllers.services import ServicesController


class Controllers:
    services: Optional[ServicesController] = None
    cluster: Optional[ClusterController] = None
    storage: Optional[StorageController] = None
    _mgr: MgrModule

    def __init__(self, mgr: MgrModule):
        self._mgr = mgr

    def start(self):
        self.services = ServicesController(self._mgr)
        self.cluster = ClusterController(self._mgr)
        self.storage = StorageController(self._mgr, self.cluster, self.services)
