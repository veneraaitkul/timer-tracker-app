import { gql } from '@apollo/client';

export const GET_PROJECTS_QUERY = gql`
  query ProjectsQuery {
    projects {
      id
      project_name
      project_description
      project_date_created
      project_is_active
    }
  }
`;

export const GET_PROJECT_QUERY = gql`
  query ProjectQuery($id: Int!) {
    project(id: $id) {
      id
      project_name
      project_description
      project_date_created
      project_is_active
    }
  }
`;

export const GET_LOG_AND_PROJECT_QUERY = gql`
  query LogQuery($id: Int!) {
    logByProject(project: $id) {
      id
      amount
      log_description
      project
    }
    project(id: $id) {
      id
      project_name
      project_description
      project_date_created
      project_is_active
    }
  }
`;
