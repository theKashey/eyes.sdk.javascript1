from __future__ import absolute_import

__version__ = "2.16.4"


def get_instance():
    from . import instance

    return instance.instance
