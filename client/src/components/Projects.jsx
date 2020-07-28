import React, { useEffect, useContext, useRef } from "react";
import { useQuery } from "@apollo/client";
import Context from "../Context/Context";
import ProjectITem from "./ProjectItem";
import { GET_PROJECTS_QUERY } from "../graphql/queries";

function Projects() {
  const context = useContext(Context);
  const isMountedRef = useRef(null);
  const { loading, error, data } = useQuery(GET_PROJECTS_QUERY);

  useEffect(() => {
    isMountedRef.current = true;

    if (data) {
      context.actions.setAvailableProjects(data.projects);
    } else if (error) {
      return console.log(`Error! ${error.message}`);
    }

    return () => {return (isMountedRef.current = false)};
  }, [data, error, context.actions]);

  return (
    <div>
      <div className="columns is-multiline">
        {loading ? (
          <span className="loader"></span>
        ) : (
          context.availableProjects.map((item, i) => {
            return (
              <div className="column is-one-quarter" key={i}>
                <ProjectITem
                  id={item.id}
                  project_name={item.project_name}
                  project_date_created={item.project_date_created}
                  project_is_active={item.project_is_active}
                />
              </div>
            );
          })
        )}
      </div>

      <div
        className={
          context.notification
            ? "notification is-danger is-light"
            : "notification is-danger is-light is-hidden"
        }
      >
        {context.notification}
      </div>
    </div>
  );
}

export default Projects;
