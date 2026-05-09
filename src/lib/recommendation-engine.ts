import { Profile } from '../types';

export interface RecommendationScore {
  profile: Profile;
  score: number;
  reason: string;
}

export class RecommendationEngine {
  /**
   * Calculate compatibility score between two profiles
   */
  static calculateCompatibility(userProfile: Profile, candidateProfile: Profile): number {
    let score = 0;

    // Skill match (40% weight)
    const teachingMatch = userProfile.learning_skills.filter(skill =>
      candidateProfile.teaching_skills.some(ts => ts.toLowerCase().includes(skill.toLowerCase()))
    ).length;
    const learningMatch = userProfile.teaching_skills.filter(skill =>
      candidateProfile.learning_skills.some(ls => ls.toLowerCase().includes(skill.toLowerCase()))
    ).length;
    const skillScore = (teachingMatch + learningMatch) / (userProfile.learning_skills.length + userProfile.teaching_skills.length) * 40;
    score += skillScore;

    // Rating (20% weight)
    const ratingScore = (candidateProfile.rating / 5) * 20;
    score += ratingScore;

    // Availability (15% weight)
    if (candidateProfile.is_available) score += 15;

    // Video verification (15% weight)
    if (candidateProfile.video_verified) score += 15;

    // Language compatibility (10% weight)
    const commonLanguages = userProfile.languages.filter(lang =>
      candidateProfile.languages.includes(lang)
    ).length;
    if (commonLanguages > 0) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Get personalized recommendations for a user
   */
  static getRecommendations(
    userProfile: Profile,
    allProfiles: Profile[],
    limit: number = 5
  ): RecommendationScore[] {
    return allProfiles
      .filter(p => p.id !== userProfile.id)
      .map(profile => ({
        profile,
        score: this.calculateCompatibility(userProfile, profile),
        reason: this.getRecommendationReason(userProfile, profile),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generate human-readable recommendation reason
   */
  private static getRecommendationReason(userProfile: Profile, candidateProfile: Profile): string {
    const teachingMatch = userProfile.learning_skills.filter(skill =>
      candidateProfile.teaching_skills.some(ts => ts.toLowerCase().includes(skill.toLowerCase()))
    );
    const learningMatch = userProfile.teaching_skills.filter(skill =>
      candidateProfile.learning_skills.some(ls => ls.toLowerCase().includes(skill.toLowerCase()))
    );

    if (teachingMatch.length > 0 && learningMatch.length > 0) {
      return `match.perfect`;
    } else if (teachingMatch.length > 0) {
      return `match.teaches`;
    } else if (learningMatch.length > 0) {
      return `match.learns`;
    } else if (candidateProfile.rating >= 4.8) {
      return `match.highlyRated`;
    } else {
      return `match.active`;
    }
  }

  /**
   * Get trending skills based on profile data
   */
  static getTrendingSkills(profiles: Profile[]): { skill: string; count: number }[] {
    const skillCount: Record<string, number> = {};

    profiles.forEach(profile => {
      [...profile.teaching_skills, ...profile.learning_skills].forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get profiles by skill
   */
  static getProfilesBySkill(profiles: Profile[], skill: string, type: 'teaching' | 'learning' = 'teaching'): Profile[] {
    return profiles.filter(p => {
      const skillList = type === 'teaching' ? p.teaching_skills : p.learning_skills;
      return skillList.some(s => s.toLowerCase().includes(skill.toLowerCase()));
    });
  }

  /**
   * Get profiles by location
   */
  static getProfilesByLocation(profiles: Profile[], location: string): Profile[] {
    return profiles.filter(p =>
      p.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  /**
   * Get top-rated profiles
   */
  static getTopRatedProfiles(profiles: Profile[], limit: number = 5): Profile[] {
    return [...profiles]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Get most active profiles (by exchange count)
   */
  static getMostActiveProfiles(profiles: Profile[], limit: number = 5): Profile[] {
    return [...profiles]
      .sort((a, b) => b.exchange_count - a.exchange_count)
      .slice(0, limit);
  }

  /**
   * Filter profiles by multiple criteria
   */
  static filterProfiles(
    profiles: Profile[],
    criteria: {
      minRating?: number;
      verified?: boolean;
      available?: boolean;
      languages?: string[];
      skills?: string[];
      minExchanges?: number;
    }
  ): Profile[] {
    return profiles.filter(p => {
      if (criteria.minRating && p.rating < criteria.minRating) return false;
      if (criteria.verified && !p.video_verified) return false;
      if (criteria.available && !p.is_available) return false;
      if (criteria.languages && !criteria.languages.some(lang => p.languages.includes(lang))) return false;
      if (criteria.skills && !criteria.skills.some(skill =>
        [...p.teaching_skills, ...p.learning_skills].some(s => s.toLowerCase().includes(skill.toLowerCase()))
      )) return false;
      if (criteria.minExchanges && p.exchange_count < criteria.minExchanges) return false;
      return true;
    });
  }
}
