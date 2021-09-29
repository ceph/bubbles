# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from pydantic import BaseModel, Field

from bubbles.utils import random_string


class AuthOptionsModel(BaseModel):
    jwt_secret: str = Field(
        title="The access token secret",
        default_factory=lambda: random_string(24),
    )
    jwt_ttl: int = Field(
        36000, title="How long an access token should live before it expires"
    )


class OptionsModel(BaseModel):
    auth: AuthOptionsModel = Field(AuthOptionsModel())


class ConfigModel(BaseModel):
    version: int = Field(title="Configuration Version")
    options: OptionsModel = Field(OptionsModel(), title="Options")
