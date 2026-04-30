export enum ClientEvent {
  CREATE_ROOM = "create_room",
  JOIN_ROOM = "join_room",
  PLAYER_READY = "player_ready",
  SUBMIT_ACTION = "submit_action",
  RECONNECT = "reconnect",
  LEAVE_ROOM = "leave_room",
}

export enum ServerEvent {
  ROOM_CREATED = "room_created",
  PLAYER_JOINED = "player_joined",
  PLAYER_READY = "player_ready",
  GAME_STARTED = "game_started",
  STATE_UPDATED = "state_updated",
  ACTION_ERROR = "action_error",
  GAME_ENDED = "game_ended",
  PLAYER_DISCONNECTED = "player_disconnected",
  PLAYER_RECONNECTED = "player_reconnected",
  PLAYER_KICKED = "player_kicked",
  PLAYER_LEFT = "player_left",
}
