const accessTokenLifespan = 30 * 60 * 1000; // in ms
const refreshTokenLifespan = 14 * 24 * 60 * 60 * 1000; // in ms
const HELPER_FEE = 6; // in %

enum Token {
  ACCESS,
  REFRESH,
}

// TODO: Come up with final number
const simultaneousApplicationLimit = 5;
const simultaneousActiveAssignmentsLimit = 10;

enum socketEventName {
  SEND_MESSAGE,
}

enum socketFeedback {
  FAILED_MESSAGE_CREATION,
  MESSAGE_DELIVERED,
  INVALID_SENDER_OR_RECIPIENT,
}

const ALLOWED_FILE_TYPES = ["jpeg", "png", "pdf"];

export {
  accessTokenLifespan,
  refreshTokenLifespan,
  Token,
  simultaneousApplicationLimit,
  simultaneousActiveAssignmentsLimit,
  socketEventName,
  socketFeedback,
  ALLOWED_FILE_TYPES,
  HELPER_FEE
};
