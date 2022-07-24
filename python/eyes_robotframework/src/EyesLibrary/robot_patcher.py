from robot.conf.settings import RobotSettings

get_rebot_settings = RobotSettings.get_rebot_settings

PROPAGATE_CLASS = "EyesLibrary.PropagateEyesTestResults"


def patched_get_rebot_settings(self):
    rebot_settings = get_rebot_settings(self)

    if PROPAGATE_CLASS in rebot_settings.pre_rebot_modifiers:
        # modifier was already added from CLI
        return rebot_settings

    rebot_settings.pre_rebot_modifiers.append(PROPAGATE_CLASS)
    return rebot_settings


RobotSettings.get_rebot_settings = patched_get_rebot_settings
