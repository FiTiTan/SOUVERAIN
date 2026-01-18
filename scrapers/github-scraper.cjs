/**
 * GitHub Scraper
 * Récupère repos publics via GitHub REST API v3
 * Auth: Personal Access Token
 */

const axios = require('axios');

class GitHubScraper {
  constructor(accessToken) {
    this.token = accessToken;
    this.baseURL = 'https://api.github.com';
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/user`, {
        headers: { Authorization: `token ${this.token}` },
        timeout: 5000
      });
      return { success: true, username: response.data.login };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async fetchRepos(username) {
    try {
      const response = await axios.get(`${this.baseURL}/users/${username}/repos`, {
        headers: { Authorization: `token ${this.token}` },
        params: {
          type: 'owner',
          sort: 'updated',
          per_page: 100
        },
        timeout: 10000
      });

      return response.data.map(repo => ({
        id: repo.id.toString(),
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || '',
        url: repo.html_url,
        homepage: repo.homepage,
        language: repo.language,
        languages_url: repo.languages_url,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        topics: repo.topics || [],
        has_readme: true // Assume true, vérifier plus tard
      }));
    } catch (err) {
      console.error('[GitHubScraper] Erreur fetch repos:', err.message);
      throw new Error(`Erreur GitHub API: ${err.message}`);
    }
  }

  async fetchRepoDetails(owner, repo) {
    try {
      // Récupérer README
      let readme = '';
      try {
        const readmeResponse = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/readme`,
          {
            headers: {
              Authorization: `token ${this.token}`,
              Accept: 'application/vnd.github.v3.raw'
            },
            timeout: 5000
          }
        );
        readme = readmeResponse.data;
      } catch (e) {
        console.log(`[GitHubScraper] Pas de README pour ${owner}/${repo}`);
      }

      // Récupérer langages
      const languagesResponse = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/languages`,
        {
          headers: { Authorization: `token ${this.token}` },
          timeout: 5000
        }
      );

      return {
        readme,
        languages: Object.keys(languagesResponse.data)
      };
    } catch (err) {
      console.error('[GitHubScraper] Erreur fetch details:', err.message);
      return { readme: '', languages: [] };
    }
  }
}

module.exports = GitHubScraper;
