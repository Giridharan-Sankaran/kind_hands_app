const Message = require("../models/Message");

async function postSystemMessage(orderId, body) {
  return Message.create({ order: orderId, sender: null, senderRole: "system", body });
}

module.exports = { postSystemMessage };
