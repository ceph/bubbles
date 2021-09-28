import sys
from unittest import mock

sys.modules["mgr_module"] = mock.MagicMock()
