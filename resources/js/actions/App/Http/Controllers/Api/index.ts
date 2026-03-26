import RoverStatusController from './RoverStatusController'
import RoverSettingsController from './RoverSettingsController'
import TelemetryController from './TelemetryController'
import CommandController from './CommandController'

const Api = {
    RoverStatusController: Object.assign(RoverStatusController, RoverStatusController),
    RoverSettingsController: Object.assign(RoverSettingsController, RoverSettingsController),
    TelemetryController: Object.assign(TelemetryController, TelemetryController),
    CommandController: Object.assign(CommandController, CommandController),
}

export default Api