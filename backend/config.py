# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
import json

from mgr_module import MgrModule

from bubbles.backend.models.config import ConfigModel, OptionsModel


class Config:
    def __init__(self, mgr: MgrModule):
        self._mgr = mgr
        config_options = mgr.get_store("config_options")
        if config_options is None:
            self._config: ConfigModel = ConfigModel(version=1)
            self.save()
        else:
            self._config = ConfigModel.parse_obj(
                json.loads(config_options))

    def save(self) -> None:
        self._mgr.set_store("config_options", self._config.json())

    @property
    def options(self) -> OptionsModel:
        return self._config.options
