import { USE_MOCK } from "../config/env";
import { internshipsMock } from "../mocks/internships.mock";
import http from "./http";

export const internshipService = {
  async getRecommended() {
    if (USE_MOCK) return internshipsMock.slice(0, 5);
    const res = await http.get("/api/internships/recommended");
    return res.json();
  },

  async getAllMatches(filters = {}, sort = "matchScore") {
    if (USE_MOCK) {
      let filtered = [...internshipsMock];

      // Filter by distance
      if (filters.distance) {
        if (filters.distance === "0-5") {
          filtered = filtered.filter((item) => item.distanceKm <= 5);
        } else if (filters.distance === "5-15") {
          filtered = filtered.filter((item) => item.distanceKm > 5 && item.distanceKm <= 15);
        } else if (filters.distance === "15-30") {
          filtered = filtered.filter((item) => item.distanceKm > 15 && item.distanceKm <= 30);
        }
      }

      // Filter by category
      if (filters.category) {
        filtered = filtered.filter((item) => item.category === filters.category);
      }

      // Filter by mode
      if (filters.mode) {
        filtered = filtered.filter((item) => item.mode === filters.mode);
      }

      // Sort
      if (sort === "matchScore") {
        filtered.sort((a, b) => b.matchScore - a.matchScore);
      } else if (sort === "distance") {
        filtered.sort((a, b) => a.distanceKm - b.distanceKm);
      }

      return filtered;
    }
    const res = await http.get("/api/internships/matches", { params: { filters, sort } });
    return res.json();
  },

  async getById(id) {
    if (USE_MOCK) {
      return internshipsMock.find((item) => item.id === id) || null;
    }
    const res = await http.get(`/api/internships/${id}`);
    return res.json();
  },

  async apply(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await http.post(`/api/internships/${id}/apply`);
    return res.json();
  },

  async withdraw(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await http.post(`/api/internships/${id}/withdraw`);
    return res.json();
  },

  async save(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await http.post(`/api/internships/${id}/save`);
    return res.json();
  },

  async unsave(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await http.post(`/api/internships/${id}/unsave`);
    return res.json();
  },

  async skip(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await http.post(`/api/internships/${id}/skip`);
    return res.json();
  },

  async simulateHrAccept(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    }
    return { success: false, error: "This method is only available in mock mode" };
  },
};

