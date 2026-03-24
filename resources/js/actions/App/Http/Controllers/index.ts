import Api from './Api'
import DashboardController from './DashboardController'
import RoverController from './RoverController'
import RoverTokenController from './RoverTokenController'
import ControlController from './ControlController'
import TelemetryWebController from './TelemetryWebController'
import StreamController from './StreamController'
import ChatController from './ChatController'
import Settings from './Settings'

const Controllers = {
    Api: Object.assign(Api, Api),
    DashboardController: Object.assign(DashboardController, DashboardController),
    RoverController: Object.assign(RoverController, RoverController),
    RoverTokenController: Object.assign(RoverTokenController, RoverTokenController),
    ControlController: Object.assign(ControlController, ControlController),
    TelemetryWebController: Object.assign(TelemetryWebController, TelemetryWebController),
    StreamController: Object.assign(StreamController, StreamController),
    ChatController: Object.assign(ChatController, ChatController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers