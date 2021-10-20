# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#

from typing import Optional

from mgr_module import MgrModule

from bubbles.backend.controllers.ceph.fs import CephFSController
from bubbles.backend.controllers.ceph.nfs import NFSController
from bubbles.backend.controllers.ceph.osd import OSD
from bubbles.backend.controllers.cluster import ClusterController
from bubbles.backend.controllers.rest_api_proxy import RestApiProxyController
from bubbles.backend.controllers.services import ServicesController
from bubbles.backend.controllers.storage import StorageController


class Controllers:
    services: Optional[ServicesController] = None
    cluster: Optional[ClusterController] = None
    storage: Optional[StorageController] = None
    rest_api_proxy: Optional[RestApiProxyController] = None

    cephfs: Optional[CephFSController] = None
    nfs: Optional[NFSController] = None
    osd: Optional[OSD] = None

    _mgr: MgrModule

    def __init__(self, mgr: MgrModule):
        self._mgr = mgr

    def start(self) -> None:
        self.services = ServicesController(self._mgr)
        self.cluster = ClusterController(self._mgr)
        self.storage = StorageController(self._mgr, self.cluster, self.services)
        self.rest_api_proxy = RestApiProxyController(self._mgr)

        # ceph related controllers
        self.cephfs = CephFSController(self._mgr)
        self.nfs = NFSController(self._mgr)
        self.osd = OSD(self._mgr)
