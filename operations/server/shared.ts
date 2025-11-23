import { gql } from "@urql/core";

export const GET_SCHOOL = gql(`
  query GetSchool($id: ID!) {
    school(id: $id) {
      id
      slug
      name
      logo
      motto
      currentTerm {
        id
      }
    }
  }
  `);

export const GET_ANNOUNCEMENTS = gql(`
  query GetAnnouncements($filter: AnnouncementFilter!, $skipGrade: Boolean!) {
    announcements(filter: $filter) {
      id
      content
      title
      publishedAt
      grade @skip(if: $skipGrade) {
        id
        name
      }
    }
  }
`);

export const GET_EVENTS = gql(`
  query GetEvents($filter: EventFilter!, $skipGrade: Boolean!) {
      events(filter: $filter) {
        id
        title
        description
        startTime
        endTime
            updatedAt
            grade @skip(if: $skipGrade) {
            id
            name
            }
        }
  }
`);
