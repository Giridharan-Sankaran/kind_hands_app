// testRequest.js
import { createRequest, getRequests, acceptRequest, completeRequest } from "./src/services/requestService.js";

// Replace with a real elder uid from your registered users (auth test)
const ELDER_UID = "HEZPLWK4OJMURIUzROi7smxs4fJ3";
const VOLUNTEER_UID = "REPLACE_WITH_VOLUNTEER_UID";

async function test() {
  try {
    // 1. create request
    const resCreate = await createRequest(
      ELDER_UID,
      "medicine",
      [{ name: "Dolo-650", quantity: "2 strips" }],
      "Toronto, ON",
      new Date().toISOString()
    );
    console.log("createRequest:", resCreate);
    if (!resCreate.success) return;

    const requestId = resCreate.id;

    // 2. get requests (all)
    const list = await getRequests();
    console.log("getRequests count:", list.requests?.length);

    // 3. accept the request (volunteer)
    const accept = await acceptRequest(VOLUNTEER_UID, requestId);
    console.log("acceptRequest:", accept);

    // 4. complete the request
    const complete = await completeRequest(requestId);
    console.log("completeRequest:", complete);

  } catch (err) {
    console.error(err);
  }
}

test();
