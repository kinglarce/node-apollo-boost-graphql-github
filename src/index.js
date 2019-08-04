import 'dotenv/config';

// There is this error.
// `Invariant Violation: 
// fetch is not found globally and no fetcher passed, to fix pass a fetch for
// your environment like https://www.npmjs.com/package/node-fetch.`

// The error occurs because the native fetch API, which is used to 
// make requests to remote APIs on a promise basis, is only available in 
// the browser. You can’t access it in a Node.js application that runs only 
// in the command line. 

// Apollo Client uses the fetch API to perform queries and mutations, usually 
// from a browser environment and not Node.js environment. Query or Mutation can 
// be performed with a simple HTTP request, so the Apollo Client uses the native 
// fetch API from a browser to perform these requests. The solution is to use a node 
// package which makes fetch available in a Node.js environment.

// This `cross-fetch` will address this issue.
import 'cross-fetch/polyfill';
import ApolloClient from 'apollo-boost';
import {
  GET_REPOSITORIES_OF_ORGANIZATION,
  ADD_STAR,
  REMOVE_STAR,
} from './graphqls';

const ORGANIZATION = 'facebook';

const client = new ApolloClient({
  uri: 'https://api.github.com/graphql',
  request: operation => {
    operation.setContext({
      headers: {
        authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
      },
    });
  },
});


client
  .query({
    query: GET_REPOSITORIES_OF_ORGANIZATION,
    variables: {
      organization: ORGANIZATION,
      cursor: undefined,
    },
  })
  // resolve first page
  .then(result => {
    const { pageInfo, edges } = result.data.organization.repositories;
    const { endCursor, hasNextPage } = pageInfo;

    console.log('first page', edges.length);
    console.log('endCursor', endCursor);

    return pageInfo;
  })
  // query second page
  .then(({ endCursor, hasNextPage }) => {
    if (!hasNextPage) {
      throw Error('no next page');
    }

    return client.query({
      query: GET_REPOSITORIES_OF_ORGANIZATION,
      variables: {
        organization: ORGANIZATION,
        cursor: endCursor,
      },
    });
  })
  // resolve second page
  .then(result => {
    const { pageInfo, edges } = result.data.organization.repositories;
    const { endCursor, hasNextPage } = pageInfo;

    console.log('second page', edges.length);
    console.log('endCursor', endCursor);

    return pageInfo;
  })
  // log error when there is no next page
  .catch(console.log);

console.log('addStar Request');
client
  .mutate({
    mutation: ADD_STAR,
    variables: {
      repositoryId: 'MDEwOlJlcG9zaXRvcnkxNzcwNDc3NzA=',
    },
  })
  .then(res => {
    console.log('Added Star : ', res.data.addStar.starrable);
    return res.data.addStar.starrable;
  })
  .then(({ id, viewerHasStarred }) => {
    console.log('removeStar Request');
    if(!viewerHasStarred)
      console.log('Cannot remove havent starred Repo');
    return client
      .mutate({
        mutation: REMOVE_STAR,
        variables: {
          repositoryId: id,
        },
      })
  })
  .then(res => {
    console.log('Removed Star : ', res.data.removeStar.starrable);
  });
