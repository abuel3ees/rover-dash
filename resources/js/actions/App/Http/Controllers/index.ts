import Api from './Api'
import DashboardController from './DashboardController'
import RoverController from './RoverController'
import RoverTokenController from './RoverTokenController'
import ControlController from './ControlController'
import TelemetryWebController from './TelemetryWebController'
import StreamController from './StreamController'
import ChatController from './ChatController'
import WhisperController from './WhisperController'
import ConversationController from './ConversationController'
import MessageController from './MessageController'
import MessageReactionController from './MessageReactionController'
import MessagePinController from './MessagePinController'
import ReadReceiptController from './ReadReceiptController'
import MessageSearchController from './MessageSearchController'
import UserDirectoryController from './UserDirectoryController'
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
    WhisperController: Object.assign(WhisperController, WhisperController),
    ConversationController: Object.assign(ConversationController, ConversationController),
    MessageController: Object.assign(MessageController, MessageController),
    MessageReactionController: Object.assign(MessageReactionController, MessageReactionController),
    MessagePinController: Object.assign(MessagePinController, MessagePinController),
    ReadReceiptController: Object.assign(ReadReceiptController, ReadReceiptController),
    MessageSearchController: Object.assign(MessageSearchController, MessageSearchController),
    UserDirectoryController: Object.assign(UserDirectoryController, UserDirectoryController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers