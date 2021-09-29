# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
import random
import string


def random_string(length: int) -> str:
    """
    Return a random text string containing printable characters.
    :param length: The length of the string.
    :return: Returns a random string.
    """
    return "".join(random.choices(string.printable, k=length))
