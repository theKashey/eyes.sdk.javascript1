from __future__ import absolute_import

__version__ = "2.16.8"


def get_instance():
    from . import instance

    return instance.instance
