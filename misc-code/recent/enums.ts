export const EVENTS = {
    CLIENT_CONNECTED: 'user connected',
    CLIENT_DISCONNECTED: 'user disconnected',
    CLIENT_MESSAGE: 'message',
    SERVER_SHUTDOWN: 'shutdown',
    ON_DEBUGGER_READY: 'onDebuggerReady',
    ON_DEVICE_SELECTED: 'onDeviceSelected',
    ON_DEVICE_GROUP_SELECTED: 'onDeviceGroupSelected',
    ON_PROTOCOL_SELECTED: 'onProtocolSelected',
    ON_PROTOCOL_GROUP_SELECTED: 'onProtocolGroupSelected',
    ON_PROTOCOL_CHANGED: 'onProtocolChanged',
    ON_MQTT_MESSAGE: 'onMQTTMessage',
    ON_DEVICE_MESSAGE: 'onDeviceMessage',
    ON_DEVICE_MESSAGE_EXT: 'onDeviceMessageExt',
    ON_COMMAND_FINISH: 'onCommandFinish',
    ON_COMMAND_PROGRESS: 'onCommandProgress',
    ON_COMMAND_PAUSED: 'onCommandPaused',
    ON_COMMAND_STOPPED: 'onCommandStopped',
    ON_COMMAND_ERROR: 'onCommandError',
    ON_DEVICE_DISCONNECTED: 'onDeviceDisconnected',
    ON_DEVICE_CONNECTED: 'onDeviceConnected',
    ON_DEVICE_CONNECTING: 'onDeviceConnecting',
    ON_DEVICE_ERROR: 'onDeviceError',
    ON_DEVICE_COMMAND: 'onDeviceCommand',
    ON_DEVICE_STATE_CHANGED: 'onDeviceStateChanged',
    ON_DEVICE_DRIVER_INSTANCE_READY: 'onDeviceDriveInstanceReady',
    ON_DRIVER_SELECTED: 'onDriverSelected',
    ON_DRIVER_GROUP_SELECTED: 'onDriverGroupSelected',
    ON_DRIVER_VARIABLE_ADDED: 'onDriverVariableAdded',
    ON_DRIVER_VARIABLE_REMOVED: 'onDriverVariableRemoved',
    ON_DRIVER_VARIABLE_CHANGED: 'onDriverVariableChanged',
    ON_DRIVER_COMMAND_ADDED: 'onDriverCommandAdded',
    ON_DRIVER_COMMAND_REMOVED: 'onDriverCommandRemoved',
    ON_DRIVER_COMMAND_CHANGE: 'onDriverVariableChanged',
    ON_SCOPE_CREATED: 'onScopeCreated',
    ON_DRIVER_MODIFIED: 'onDriverModified',
    SET_DEVICE_VARIABLES: 'setDeviceVariables',
    ON_SERVER_LOG_MESSAGE: 'onServerLogMessage',
    ON_CLIENT_LOG_MESSAGE: 'onClientLogMessage',
    ON_DEVICE_SERVER_CONNECTED: 'onDeviceServerConnected',
    ON_RUN_CLASS_EVENT: 'onRunClassEvent'
};

export enum COMMANDS {
    RUN_FILE = 'Run_File',
    RUN_CLASS = 'Run_Class',
    RUN_APP_SERVER_CLASS = 'Run_App_Server_Class',
    RUN_APP_SERVER_CLASS_METHOD = 'Run_App_Server_Class_Method',
    RUN_APP_SERVER_COMPONENT_METHOD = 'Run_App_Server_Component_Method',
    CANCEL_APP_SERVER_COMPONENT_METHOD = 'Cancel_App_Server_Component_Method',
    ANSWER_APP_SERVER_COMPONENT_METHOD_INTERRUPT = 'Answer_App_Server_Component_Method_Interrupt',
    SIGNAL_DEVICE = 'Device_command',
    SIGNAL_RESPONSE = 'WebSocket_response',
    MANAGER_CLOSE_ALL = 'Close_All_Connections',
    MANAGER_START_DRIVER = 'startDriver',
    START_DEVICE = 'startDevice',
    STOP_DEVICE = 'stopDevice',
    DEVICE_UPDATE = 'deviceUpdated',
    CREATE_CONNECTION = 'createConnection',
    MANAGER_STOP_DRIVER = 'stopDriver',
    DEVICE_SEND = 'Device_Send',
    CALL_METHOD = 'Call_Method',
    RUN_SHELL = 'Run_Shell',
    WATCH = 'Watch_Directory',
    MQTT_PUBLISH = 'MQTT_PUBLISH',
    MQTT_SUBSCRIBE = 'MQTT_SUBSCRIBE',
    GET_DEVICE_VARIABLES = 'getVariables',
    WRITE_LOG_MESSAGE = 'Write_Log_Message',
    INIT_DEVICES = 'INIT_DEVICES',
    PROTOCOL_METHOD = 'PROTOCOL_METHOD'
}

export enum LOGGING_SIGNAL {
    DEVICE_CONNECTED = 'Device Connected',
    DEVICE_DISCONNECTED = 'Device Disonnected',
    RESPONSE = 'Response',
    SEND_COMMAND = 'Send Command',
    DEVICE_ERROR = 'Device Error'
};

export enum LOGGING_FLAGS {
    /**
     * No logging
     * @constant
     * @type int
     */
    NONE = 0x00000000,
    /**
     * Log in the IDE's global console
     * @constant
     * @type int
     */
    GLOBAL_CONSOLE = 0x00000001,
    /**
     * Log in the IDE's status bar
     * @constant
     * @type int
     */
    STATUS_BAR = 0x00000002,
    /**
     * Create notification popup in the IDE
     * @constant
     * @type int
     */
    POPUP = 0x00000004,
    /**
     * Log to file
     * @constant
     * @type int
     */
    FILE = 0x00000008,
    /**
     * Log into the IDE's dev tool's console
     * @constant
     * @type int
     */
    DEV_CONSOLE = 0x00000010,
    /**
     * Log into the device's IDE console
     * @constant
     * @type int
     */
    DEVICE_CONSOLE = 0x00000020
};
