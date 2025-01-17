import os
import uuid
import warnings

# Generate APPLITOOLS_BATCH_ID for xdist run in case it was not provided externally
os.environ["APPLITOOLS_BATCH_ID"] = os.getenv("APPLITOOLS_BATCH_ID", str(uuid.uuid4()))
# Keep batch open after runner termination
os.environ["APPLITOOLS_DONT_CLOSE_BATCHES"] = "true"

# Outdated versions of these modules have invalid escape sequences
# in some docstrings. To ignore these irrelevant warnings import modules early
# having filter in place.
# Warnings are only issued during module interpretation, it is not
# issued when cached bytecode is found and loaded by the interpreter.
# Make sure to wipe cached bytecode when verifying that modules still
# produce these warnings.
with warnings.catch_warnings():
    warnings.filterwarnings("ignore", "invalid escape", category=DeprecationWarning)

    try:
        import kitchen.text.converters
        import selenium.webdriver.remote.webdriver
    except ImportError:
        pass
