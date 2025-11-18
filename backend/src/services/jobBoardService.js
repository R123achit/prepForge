import axios from 'axios';

class JobBoardService {
  constructor() {
    this.linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
    this.linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.indeedPublisherId = process.env.INDEED_PUBLISHER_ID;
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
  }

  // Search jobs on Indeed
  async searchIndeedJobs(query, location = '', limit = 25) {
    try {
      // If no publisher ID, return mock data for testing
      if (!this.indeedPublisherId || this.indeedPublisherId === 'your-indeed-publisher-id') {
        return this.getMockJobs(query, location, limit, 'indeed');
      }

      const response = await axios.get('http://api.indeed.com/ads/apisearch', {
        params: {
          publisher: this.indeedPublisherId,
          q: query,
          l: location,
          sort: 'relevance',
          radius: 25,
          st: 'jobsite',
          jt: 'all',
          start: 0,
          limit: limit,
          fromage: 30,
          format: 'json',
          v: '2'
        }
      });

      return {
        success: true,
        jobs: response.data.results?.map(job => ({
          id: job.jobkey,
          title: job.jobtitle,
          company: job.company,
          location: job.formattedLocation,
          snippet: job.snippet,
          url: job.url,
          date: job.date,
          source: 'indeed'
        })) || []
      };
    } catch (error) {
      console.error('Indeed API Error:', error.message);
      // Return mock data as fallback
      return this.getMockJobs(query, location, limit, 'indeed');
    }
  }

  // Get LinkedIn authorization URL
  getLinkedInAuthUrl(redirectUri) {
    const scope = 'r_liteprofile r_emailaddress';
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.linkedinClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  }

  // Exchange LinkedIn code for access token
  async getLinkedInAccessToken(code, redirectUri) {
    try {
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: this.linkedinClientId,
        client_secret: this.linkedinClientSecret
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      return { success: true, token: response.data.access_token };
    } catch (error) {
      return { success: false, error: 'Failed to get LinkedIn access token' };
    }
  }

  // Search jobs using JSearch API (RapidAPI)
  async searchJSearchJobs(query, location = '', limit = 25) {
    try {
      if (!this.rapidApiKey || this.rapidApiKey === 'your-rapidapi-key') {
        return this.getMockJobs(query, location, limit, 'jsearch');
      }

      const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
        params: {
          query: `${query} ${location}`.trim(),
          page: '1',
          num_pages: '1',
          date_posted: 'all'
        },
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      });

      return {
        success: true,
        jobs: response.data.data?.slice(0, limit).map(job => ({
          id: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.job_country,
          snippet: job.job_description?.substring(0, 200) + '...',
          url: job.job_apply_link || job.job_offer_expiration_datetime,
          date: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() : 'Recently',
          source: 'jsearch'
        })) || []
      };
    } catch (error) {
      console.error('JSearch API Error:', error.message);
      return this.getMockJobs(query, location, limit, 'jsearch');
    }
  }

  // Search jobs using RapidAPI (alternative for LinkedIn jobs)
  async searchLinkedInJobs(query, location = '', limit = 25) {
    try {
      // Use JSearch API for LinkedIn-style jobs
      return this.searchJSearchJobs(query, location, limit);
    } catch (error) {
      console.error('LinkedIn Jobs API Error:', error.message);
      return this.getMockJobs(query, location, limit, 'linkedin');
    }
  }

  // Combined job search
  async searchJobs(query, location = '', sources = ['indeed'], limit = 25) {
    const results = [];
    const promises = [];

    if (sources.includes('indeed')) {
      promises.push(this.searchIndeedJobs(query, location, Math.ceil(limit / sources.length)));
    }

    if (sources.includes('linkedin')) {
      promises.push(this.searchLinkedInJobs(query, location, Math.ceil(limit / sources.length)));
    }

    if (sources.includes('jsearch')) {
      promises.push(this.searchJSearchJobs(query, location, Math.ceil(limit / sources.length)));
    }

    const responses = await Promise.allSettled(promises);
    
    responses.forEach(response => {
      if (response.status === 'fulfilled' && response.value.success) {
        results.push(...response.value.jobs);
      }
    });

    return {
      success: true,
      jobs: results.slice(0, limit),
      total: results.length
    };
  }
  // Mock job data for testing
  getMockJobs(query, location, limit, source) {
    const mockJobs = [
      {
        id: `${source}-1`,
        title: `Senior ${query} Developer`,
        company: 'TechCorp Inc.',
        location: location || 'Remote',
        snippet: `We are looking for an experienced ${query} professional to join our dynamic team. This role offers excellent growth opportunities and competitive compensation.`,
        url: '#',
        date: '2 days ago',
        source: source
      },
      {
        id: `${source}-2`,
        title: `${query} Engineer`,
        company: 'Innovation Labs',
        location: location || 'New York, NY',
        snippet: `Join our team as a ${query} engineer and work on cutting-edge projects. We offer flexible work arrangements and comprehensive benefits.`,
        url: '#',
        date: '1 week ago',
        source: source
      },
      {
        id: `${source}-3`,
        title: `Junior ${query} Specialist`,
        company: 'StartupXYZ',
        location: location || 'San Francisco, CA',
        snippet: `Entry-level position for ${query} enthusiasts. Great opportunity to learn and grow in a fast-paced startup environment.`,
        url: '#',
        date: '3 days ago',
        source: source
      },
      {
        id: `${source}-4`,
        title: `Lead ${query} Architect`,
        company: 'Enterprise Solutions',
        location: location || 'Austin, TX',
        snippet: `Lead our ${query} initiatives and mentor junior developers. Requires 5+ years of experience and strong leadership skills.`,
        url: '#',
        date: '5 days ago',
        source: source
      },
      {
        id: `${source}-5`,
        title: `${query} Consultant`,
        company: 'Global Consulting',
        location: location || 'Chicago, IL',
        snippet: `Work with diverse clients on ${query} projects. Travel opportunities and competitive salary package included.`,
        url: '#',
        date: '1 day ago',
        source: source
      }
    ];

    return {
      success: true,
      jobs: mockJobs.slice(0, limit)
    };
  }
}

export default new JobBoardService();