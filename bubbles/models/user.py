# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
from typing import List, Optional

from pydantic import BaseModel, Field


class UserModel(BaseModel):
    username: str = Field(title="The user name")
    roles: List[str] = Field(title="The list of roles")
    name: Optional[str] = Field(title="The full name")
    email: Optional[str] = Field(title="The email address")
    last_update: int = Field(
        alias="lastUpdate", title="The Unix time stamp of the last update"
    )
    enabled: bool = Field(title="Is the user enabled")
    pwd_expiration_date: Optional[int] = Field(
        alias="pwdExpirationDate",
        title="The expiration date as Unix time stamp",
    )
    pwd_update_required: bool = Field(
        alias="pwdUpdateRequired", title="Password update required"
    )
