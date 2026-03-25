import RoverStatusController from './RoverStatusController'
import TelemetryController from './TelemetryController'
import CommandController from './CommandController'

const Api = {
    RoverStatusController: Object.assign(RoverStatusController, RoverStatusController),
    TelemetryController: Object.assign(TelemetryController, TelemetryController),
    CommandController: Object.assign(CommandController, CommandController),
}

export default Api