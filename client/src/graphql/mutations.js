import { gql } from '@apollo/client';

export const ADD_PROJECT = gql`
  mutation CreateProject(
    $project_name: String!
    $project_description: String!
    $project_date_created: String!
    $project_is_active: Int!
  ) {
    createProject(
      project_name: $project_name
      project_description: $project_description
      project_date_created: $project_date_created
      project_is_active: $project_is_active
    ) {
      id
      project_name
      project_description
      project_date_created
      project_is_active
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: Int!) {
    deleteProject(id: $id)
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: Int!, $project_name: String!, $project_description: String!, $project_is_active: Int!) {
    updateProject(
      id: $id
      project_name: $project_name
      project_description: $project_description
      project_is_active: $project_is_active
    )
  }
`;

export const ADD_LOG = gql`
  mutation CreateLog($log_description: String!, $amount: Int!, $project: Int!) {
    createLog(log_description: $log_description, amount: $amount, project: $project) {
      id
      log_description
      amount
      project
    }
  }
`;

export const DELETE_LOG = gql`
  mutation DeleteLog($id: Int!) {
    deleteLog(id: $id)
  }
`;

export const DELETE_LOG_BY_PROJECT = gql`
  mutation DeleteLog($project: Int!) {
    deleteLog(project: $project)
  }
`;
