"use client";

import axios from "axios";
import { env } from "~/env";

axios.defaults.baseURL = env.NEXT_PUBLIC_API_BASE_URL;
axios.defaults.withCredentials = true;

export const axiosInstance = axios.create();
