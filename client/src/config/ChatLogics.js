// Logic to Keep the name of the chat as the sender's name
// if the chat is not a group chat.

export const getSender = (loggedUser, users) => {
  if (users && users.length >= 2) {
    return users[0]._id === loggedUser?._id ? users[1].name : users[0].name;
  }
  return "";
};

export const getSenderFull = (loggedUser, users) => {
  if (users && users.length >= 2) {
    return users[0]._id === loggedUser?._id ? users[1] : users[0];
  }
  return {};
};

// m- current message
// i - index of current message
// The function returns `true` only if the current message is by a different sender than the next one
// and is not sent by the user identified by `userID`. Otherwise, it returns `false`.
export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

// Checks to see if current chat and next chat are from same 
// person or different. If different then apply margin left accordingly
export const isSameSenderMargin = (messages, m, i, userId) => {

  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

// Checks to see if previous and current message are sent by 
// the same person, if yes then provide margin top accordingly
export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};
