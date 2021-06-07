import React, { useContext } from 'react';
import styled from 'styled-components';
import { GithubContext } from '../context/context';
import { ExampleChart, Pie3D, Column3D, Bar3D, Doughnut2D } from './Charts';

const sortAndSlice = (obj, prop = 'value') => {
  return Object.values(obj)
    .sort((prev, next) => next[prop] - prev[prop])
    .map((item) => {
      return { ...item, value: item[prop] };
    })
    .slice(0, 5);
};

const Repos = () => {
  const { repos } = useContext(GithubContext);

  const languages = repos.reduce((total, item) => {
    const { language, stargazers_count } = item;

    if (!language) return total;
    if (!total[language]) {
      total[language] = { label: language, value: 1, stars: stargazers_count };
    } else {
      total[language] = {
        ...total[language],
        value: total[language].value + 1,
        stars: total[language].stars + stargazers_count,
      };
    }
    return total;
  }, {});

  const mostUsed = sortAndSlice(languages);

  const mostStarred = sortAndSlice(languages, 'stars');

  const popularRepos = repos.reduce((total, item) => {
    const { name, forks, stargazers_count } = item;
    total[name] = { label: name, stars: stargazers_count, forks };
    // total.forks[name] = { label: name, value: forks };

    return total;
  }, {});

  const mostPopular = sortAndSlice(popularRepos, 'stars');
  const mostForked = sortAndSlice(popularRepos, 'forks');

  return (
    <section className="section">
      <Wrapper className="section-center">
        <Pie3D data={mostUsed} />
        <Column3D data={mostPopular} />
        <Doughnut2D data={mostStarred} />
        <Bar3D data={mostForked} />
      </Wrapper>
    </section>
  );
};

const Wrapper = styled.div`
  display: grid;
  justify-items: center;
  gap: 2rem;
  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1200px) {
    grid-template-columns: 2fr 3fr;
  }

  div {
    width: 100% !important;
  }
  .fusioncharts-container {
    width: 100% !important;
  }
  svg {
    width: 100% !important;
    border-radius: var(--radius) !important;
  }
`;

export default Repos;
