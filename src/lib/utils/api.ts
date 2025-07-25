import { createFetch } from "@better-fetch/fetch";
import { API_URL } from "./constants";

const apiFetch = createFetch({
  baseURL: API_URL,
  retry: {
    type: "linear",
    attempts: 3,
    delay: 1000,
  },
  retryDelay: 1000,
});

export default apiFetch;
