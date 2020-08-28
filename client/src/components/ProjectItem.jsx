import React, { memo, useContext } from "react";
import { useMutation } from "@apollo/client";
import Moment from "react-moment";
import { Link } from "react-router-dom";
import Context from "../Context/Context";
import { DELETE_PROJECT } from "../graphql/mutations";

const ProjectItem = memo(({
  id,
  project_name,
  project_date_created,
}) => {
  const context = useContext(Context);

  // mutation
  const [deleteProject] = useMutation(DELETE_PROJECT);

  // remove one specific project
  const removeProject = () => {
    deleteProject({
      variables: {
        id: id,
      },
    })
      .then((response) => {
        let projects = [...context.availableProjects];
        projects.splice(
          projects.findIndex((item) => {return item.id === id}),
          1
        );
        context.actions.setAvailableProjects(projects);

        context.actions.setNotification(
          `Project "${project_name}" was removed!`
        );

        setTimeout(() => {
          context.actions.setNotification("");
        }, 3000);
      })
      .catch((err) => {return console.log(err)});
  };

  return (
    <div className="card mb-4">
      <header className="card-header">
        <p className="card-header-title ml-2">{project_name}</p>
        <span className="card-header-icon">
          <span
            className="icon is-small has-text-danger  mr-4"
            onClick={() => {return removeProject()}}
          >
            <span className="material-icons is-size-6">delete</span>
          </span>

          <Link to={`/edit/${id}`} className="icon is-small has-text-light">
            <span className="material-icons is-size-6">create</span>
          </Link>
        </span>
      </header>
      <div className="card-content">
        <div className="content">
          <p>
            <span className="has-text-weight-semibold mr-2"> Date:</span>
            <Moment format="YYYY-MM-DD HH:mm">{project_date_created}</Moment>
          </p>
        </div>
      </div>
      <footer className="card-footer">
        <Link to={`/projects/${id}`} className="card-footer-item">
          <button className="button is-link has-text-light is-small is-outlined">
            <span>More details</span>
            <span className="icon is-small">
              <span className="material-icons">navigate_next</span>
            </span>
          </button>
        </Link>
      </footer>
    </div>
  );
});

ProjectItem.displayName = 'ProjectItem';

export default ProjectItem;
