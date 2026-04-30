import RoverStatusController from './RoverStatusController'
import RoverSettingsController from './RoverSettingsController'
import FrameController from './FrameController'
import HlsController from './HlsController'
import TelemetryController from './TelemetryController'
import CommandController from './CommandController'

const Api = {
    RoverStatusController: Object.assign(RoverStatusController, RoverStatusController),
    RoverSettingsController: Object.assign(RoverSettingsController, RoverSettingsController),
    FrameController: Object.assign(FrameController, FrameController),
    HlsController: Object.assign(HlsController, HlsController),
    TelemetryController: Object.assign(TelemetryController, TelemetryController),
    CommandController: Object.assign(CommandController, CommandController),
}

export default Api