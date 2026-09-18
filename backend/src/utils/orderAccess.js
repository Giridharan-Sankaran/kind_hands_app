const ApiError = require("./ApiError");

// Only the owning elder, the assigned volunteer, or an admin may access a
// given order's details, messages, or live location. Anyone else gets a
// 403, not a 404, so we don't leak whether the id exists.
function assertOrderAccess(order, user) {
  if (!order) {
    throw new ApiError(404, "We couldn't find that order.");
  }

  const elderId = order.elder?._id ? order.elder._id.toString() : order.elder?.toString();
  const volunteerId = order.volunteer?._id ? order.volunteer._id.toString() : order.volunteer?.toString();
  const isOwnerElder = elderId === user.id;
  const isAssignedVolunteer = Boolean(volunteerId) && volunteerId === user.id;

  if (user.role !== "admin" && !isOwnerElder && !isAssignedVolunteer) {
    throw new ApiError(403, "You don't have permission to access this order.");
  }

  return { isOwnerElder, isAssignedVolunteer };
}

module.exports = { assertOrderAccess };
