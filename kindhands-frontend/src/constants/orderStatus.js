// src/constants/orderStatus.js
export const STATUS_LABELS = {
  placed: "Placed",
  searching_volunteer: "Searching for a volunteer",
  volunteer_assigned: "Volunteer assigned",
  going_to_shop: "Volunteer heading to shop",
  shopping_in_progress: "Shopping in progress",
  items_purchased: "Items purchased",
  heading_to_elder: "Volunteer on the way",
  near_destination: "Volunteer nearby",
  arrived: "Volunteer arrived",
  otp_verification: "Verifying delivery",
  delivered: "Delivered",
  payment_completed: "Payment completed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_TONES = {
  searching_volunteer: "marigold",
  volunteer_assigned: "pine",
  going_to_shop: "pine",
  shopping_in_progress: "pine",
  items_purchased: "pine",
  heading_to_elder: "pine",
  near_destination: "pine",
  arrived: "pine",
  otp_verification: "pine",
  delivered: "moss",
  payment_completed: "moss",
  completed: "moss",
  cancelled: "neutral",
  placed: "neutral",
};

// The forward-only sequence a volunteer advances an order through, and the
// label for the button that triggers each step. Mirrors STATUS_SEQUENCE on
// the backend — the backend is the source of truth on what's allowed;
// this is just for rendering the right button.
export const STATUS_FLOW = [
  { from: "volunteer_assigned", next: "going_to_shop", label: "Start heading to shop" },
  { from: "going_to_shop", next: "shopping_in_progress", label: "I'm at the shop — start shopping" },
  { from: "shopping_in_progress", next: "items_purchased", label: "Items purchased" },
  { from: "items_purchased", next: "heading_to_elder", label: "Start delivery" },
  { from: "heading_to_elder", next: "arrived", label: "I've arrived" },
  { from: "arrived", next: "delivered", label: "Payment received — mark delivered" },
];
