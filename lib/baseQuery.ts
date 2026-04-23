import { API_BASE_URL } from "@/utils/constants";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const createBaseQuery = () => {
  return fetchBaseQuery({
    baseUrl: API_BASE_URL,
  });
};

export default createBaseQuery;


