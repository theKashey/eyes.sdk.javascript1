import os
import sys

from applitools.selenium.__version__ import __version__

os.environ["APPLITOOLS_BATCH_NAME"] = "Py{}.{}|Img|{}|{}".format(
    sys.version_info.major,
    sys.version_info.minor,
    __version__,
    sys.platform,
)
