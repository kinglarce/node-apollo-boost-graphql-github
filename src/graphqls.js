import { gql } from 'apollo-boost';

export const GET_REPOSITORIES_OF_ORGANIZATION = gql`
query($organization: String!, $cursor: String) {
  organization(login: $organization) {
    name
    url
    repositories(
      first: 5
      orderBy: { direction: DESC, field: STARGAZERS }
      after: $cursor
    ) {
      edges {
        node {
          ...repository
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
fragment repository on Repository {
  name
  url
}
`;

export const ADD_STAR = gql`
mutation AddStar($repositoryId: ID!) {
  addStar(input: { starrableId: $repositoryId }) {
    starrable {
      id
      viewerHasStarred
    }
  }
}
`;

export const REMOVE_STAR = gql`
mutation RemoveStar($repositoryId: ID!) {
  removeStar(input: { starrableId: $repositoryId }) {
    starrable {
      id
      viewerHasStarred
    }
  }
}
`;