import React, { useState, useEffect, createContext } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

export const GithubContext = createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);

  const [requests, setRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: '' });

  const searchGithubUser = async (user) => {
    // console.log(user);
    toggleErrors();
    setIsLoading(true);
    try {
      const res = await axios(`${rootUrl}/users/${user}`);
      setGithubUser(res.data);

      const { login, followers_url } = res.data;

      await Promise.allSettled([
        axios(`${rootUrl}/users/${login}/repos?per_page=100`),
        axios(`${followers_url}?per_page=100`),
      ]).then(([repos, followers]) => {
        if (repos.status === 'fulfilled') {
          setRepos(repos.value.data);
        }
        if (followers.status === 'fulfilled') {
          setFollowers(followers.value.data);
        }
      });
    } catch (error) {
      toggleErrors(true, "User doesn't exist");
      console.log(error.message);
    }
    checkRequests();
    setIsLoading(false);
  };

  const checkRequests = () => {
    axios
      .get(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data;

        setRequests(remaining);

        if (remaining === 0) {
          toggleErrors(true, 'Sorry you have exceeded your hourly rate limit');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const toggleErrors = (show = false, msg = '') => {
    setError({ show, msg });
  };

  useEffect(checkRequests, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
        isLoading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export default GithubProvider;
