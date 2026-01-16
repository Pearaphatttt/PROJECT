import { USE_MOCK } from "../config/env";
import { internshipService } from "./internshipService";
import { studentProfileService } from "./studentProfileService";
import http from "./http";

// Compute match score between student and internship
export const computeScore = (studentProfile, internship) => {
  if (!studentProfile || !internship) {
    return {
      totalScore: 0,
      matchedSkills: [],
      missingMustSkills: [],
      breakdown: {
        skillsPct: 0,
        distancePct: 0,
        interestPct: 0,
      },
    };
  }

  const studentSkills = studentProfile.skills || [];
  const mustSkills = internship.mustSkills || [];
  const niceSkills = internship.niceSkills || [];

  // Calculate must skills match
  const matchedMust = studentSkills.filter((skill) =>
    mustSkills.some((must) => must.toLowerCase() === skill.toLowerCase())
  );
  const mustPct = mustSkills.length > 0
    ? (matchedMust.length / mustSkills.length) * 100
    : 0;

  // Calculate nice skills bonus
  const matchedNice = studentSkills.filter((skill) =>
    niceSkills.some((nice) => nice.toLowerCase() === skill.toLowerCase())
  );
  const niceBonus = niceSkills.length > 0
    ? (matchedNice.length / niceSkills.length) * 20 // Max 20 points
    : 0;

  // Total score: 80% must skills + 20% nice skills bonus
  const totalScore = Math.min(100, Math.round(mustPct * 0.8 + niceBonus));

  // Missing must skills
  const missingMustSkills = mustSkills.filter(
    (must) => !studentSkills.some((skill) => skill.toLowerCase() === must.toLowerCase())
  );

  // All matched skills (must + nice)
  const matchedSkills = [...matchedMust, ...matchedNice];

  return {
    totalScore,
    matchedSkills,
    missingMustSkills,
    breakdown: {
      skillsPct: totalScore,
      distancePct: 0, // For now
      interestPct: 0, // For now
    },
  };
};

// Get candidates for an internship
export const getCandidatesForInternship = async (internshipId, opts = {}) => {
  if (USE_MOCK) {
    const { minScore = 0, province, sort = 'score' } = opts;

    // Load internship
    const internship = await internshipService.getById(internshipId);
    if (!internship) {
      return [];
    }

    // Load all students
    const students = await studentProfileService.getAllStudents();

    // Compute scores for each student
    const candidates = students
      .map((student) => {
        const scoreData = computeScore(student, internship);
        return {
          ...student,
          matchScore: scoreData.totalScore,
          matchedSkills: scoreData.matchedSkills,
          missingMustSkills: scoreData.missingMustSkills,
          breakdown: scoreData.breakdown,
        };
      })
      .filter((candidate) => {
        // Filter by min score
        if (candidate.matchScore < minScore) return false;
        // Filter by province if specified
        if (province && candidate.province !== province) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'score') {
          return b.matchScore - a.matchScore;
        }
        return 0;
      });

    return candidates;
  }

  const res = await http.get(`/api/internships/${internshipId}/candidates`, { params: opts });
  return res.json();
};

export const matchingService = {
  computeScore,
  getCandidatesForInternship,
};
