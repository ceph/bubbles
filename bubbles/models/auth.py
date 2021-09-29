# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from pydantic import BaseModel, Field


class LoginModel(BaseModel):
    access_token: str = Field(title="The access token")
    token_type: str = Field("bearer")
