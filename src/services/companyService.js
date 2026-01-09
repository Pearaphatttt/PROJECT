import { USE_MOCK } from "../config/env";
import { companyMock } from "../mocks/company.mock";
import http from "./http";

export const companyService = {
  async getMe() {
    if (USE_MOCK) return companyMock;
    const res = await http.get("/api/company/me");
    return res.json();
  },
  async getCandidateMatches() {
    if (USE_MOCK) return companyMock.candidateMatches;
    const res = await http.get("/api/company/candidates/matches");
    return res.json();
  }
};

