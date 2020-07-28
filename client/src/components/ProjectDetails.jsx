import React, { useState, useContext, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useParams, useHistory } from "react-router-dom";
import Moment from "react-moment";
import { ADD_LOG, DELETE_LOG } from "../graphql/mutations";
import { GET_LOG_AND_PROJECT_QUERY } from "../graphql/queries";
import Context from "../Context/Context";

function ProjectDetails() {
  let history = useHistory();
  const context = useContext(Context);

  // get project ID from url
  let { id } = useParams();
  id = parseInt(id);

  const [selectedMenu, setSelectedMenu] = useState("WorkLog");
  const [logHours, setLogHours] = useState();
  const [logDescription, setLogDescription] = useState();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const isMountedRef = useRef(null);

  // query
  const { loading, error, data } = useQuery(GET_LOG_AND_PROJECT_QUERY, {
    variables: { id },
  });

  // Listen for the event.
  useEffect(() => {
    isMountedRef.current = true;

    if (data) {
      context.actions.setProjectTimeLogs(data.logByProject);
      context.actions.setSelectedProject(data.project);
    } else if (error) {
      return console.log(`Error! ${error.message}`);
    }

    return () => {
      return (isMountedRef.current = false);
    };
  }, [data, context.actions, error]);

  // mutations
  const [createLog] = useMutation(ADD_LOG);
  const [deleteLog] = useMutation(DELETE_LOG);

  // calc sum of total registered hours
  let initialValue = 0;
  let time = context.projectTimeLogs.reduce((acc, curr) => {
    return acc + (curr.amount && curr.amount);
  }, initialValue);

  // it prevents unnecessary re-rendering
  let timer;
  let debounce = function (func, delay) {
    // cancels the setTimeout method execution
    clearTimeout(timer);

    // executes the func after delay time.
    timer = setTimeout(func, delay);
  };

  // set description
  const handleDescriptionChange = (e) => {
    e.persist();
    debounce(() => {
      setLogDescription(e.target.value);
    }, 200);
  };

  // set log hours
  const handleLogChange = (e) => {
    e.persist();
    debounce(() => {
      setLogHours(e.target.value);
    }, 200);
  };

  // submit data to database
  const submitLogHours = () => {
    if (!logHours && !logDescription) {
      setIsError(true);
      setMessage("Please make sure to fill all required fields.");
      setTimeout(() => {
        setIsError(false);
        setMessage("");
      }, 3000);
    } else {
      createLog({
        variables: {
          log_description: logDescription,
          amount: parseInt(logHours),
          project: id,
        },
      })
        .then((response) => {
          const newLog = response.data.createLog[0];
          const logs = [...context.projectTimeLogs];
          logs.push(newLog);

          context.actions.setProjectTimeLogs(logs);

          setMessage(`Time log was created.`);

          setTimeout(() => {
            setMessage("");
            setLogDescription("");
            setLogHours("");
          }, 3000);
        })
        .catch((err) => {
          return console.log(err);
        });
    }
  };

  // remove one specific log
  const removeLog = (id) => {
    deleteLog({
      variables: {
        id: id,
      },
    })
      .then((response) => {
        const logs = [...context.projectTimeLogs];
        logs.splice(
          logs.findIndex((item) => {
            return item.id === id;
          }),
          1
        );
        context.actions.setProjectTimeLogs(logs);
      })
      .catch((err) => {
        return console.log(err);
      });
  };

  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div
        className="modal-card"
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <header className="modal-card-head">
          <p className="modal-card-title">
            Project details:
            <span className="has-text-weight-semibold ml-2">
              {context.selectedProject.project_name}
            </span>
          </p>
          <button
            className="delete"
            aria-label="close"
            onClick={() => {
              return history.goBack();
            }}
          ></button>
        </header>
        <section className="modal-card-body">
          {loading ? (
            <span className="loader"></span>
          ) : (
            <>
              <p className="is-size-6 has-text-weight-semibold   mb-3">
                Created date:
                <span className="has-text-weight-normal ml-2">
                  <Moment format="YYYY-MM-DD HH:mm">
                    {context.selectedProject.project_date_created}
                  </Moment>
                </span>
              </p>

              <p className="is-size-6 has-text-weight-semibold  mb-3">
                Description:
                <span className="has-text-weight-normal mt-2 is-block">
                  {context.selectedProject.project_description}
                </span>
              </p>

              <p className="is-size-6 has-text-weight-semibold  mb-3">
                State:
                {context.selectedProject.project_is_active === 1 ? (
                  <span className="has-text-weight-semibold has-text-success ml-2">
                    Active
                  </span>
                ) : (
                  <span className="has-text-weight-semibold has-text-danger ml-2">
                    Closed
                  </span>
                )}
              </p>

              <p className="is-size-6 has-text-weight-semibold  mb-5">
                Total hours:
                <span className="ml-2">{time}h</span>
              </p>

              <nav className="level is-mobile">
                <div className="level-left">
                  <div className="level-item">
                    <p className="subtitle is-7 has-text-weight-semibold">
                      Activity
                    </p>
                  </div>

                  <div className="level-item">
                    <button
                      className={
                        selectedMenu === "WorkLog"
                          ? "button is-small is-light is-primary is-active"
                          : "button is-small is-light "
                      }
                      onClick={() => {
                        return setSelectedMenu("WorkLog");
                      }}
                    >
                      <span>Work Log</span>
                    </button>
                  </div>

                  <div className="level-item">
                    <button
                      className={
                        selectedMenu === "NewLog"
                          ? "button is-small is-light is-primary is-active"
                          : "button is-small is-light "
                      }
                      onClick={() => {
                        return setSelectedMenu("NewLog");
                      }}
                    >
                      <span>New Log</span>
                      <span className="icon is-small">
                        <span className="material-icons is-size-6">add</span>
                      </span>
                    </button>
                  </div>
                </div>
              </nav>

              <div
                className={
                  selectedMenu === "WorkLog"
                    ? "table-container"
                    : "table-container is-hidden"
                }
              >
                <table className="table is-fullwidth is-size-7">
                  <thead>
                    <tr>
                      <th>Hours</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {context.projectTimeLogs.map((item, i) => {
                      return (
                        <tr key={i}>
                          <td>{item.amount}h</td>
                          <td>
                            <span className="is-ellipsis">
                              {" "}
                              {item.log_description}
                            </span>
                          </td>
                          <td>
                            <button
                              className="button icon is-small has-text-danger  mr-3"
                              onClick={() => {
                                return removeLog(item.id);
                              }}
                            >
                              <span className="material-icons is-size-6">
                                delete
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div
                className={
                  selectedMenu === "NewLog" ? "field" : "field is-hidden"
                }
              >
                <div className="field">
                  <label className="label is-small">Hours</label>
                  <div className="control">
                    <input
                      className={
                        isError ? "input is-danger is-small" : "input is-small"
                      }
                      type="number"
                      id="hours"
                      name="hours"
                      min="1"
                      max="100"
                      onChange={handleLogChange}
                    ></input>
                  </div>
                </div>

                <div className="field">
                  <label className="label  is-small">Log description</label>
                  <div className="control">
                    <textarea
                      className={
                        isError
                          ? "textarea is-danger is-small"
                          : "textarea is-small"
                      }
                      placeholder="Textarea"
                      maxLength="150"
                      onChange={handleDescriptionChange}
                    ></textarea>
                  </div>
                </div>

                <div className="field is-grouped is-grouped-right">
                  <p
                    className={
                      isError ? "help is-danger mr-3" : "help is-success mr-3"
                    }
                  >
                    {message}
                  </p>
                  <p className="control">
                    <button
                      className="button is-small is-primary"
                      onClick={() => {
                        return submitLogHours();
                      }}
                    >
                      Submit
                    </button>
                  </p>
                  <p className="control">
                    <button
                      className="button is-small is-light"
                      onClick={() => {
                        return setSelectedMenu("WorkLog");
                      }}
                    >
                      Cancel
                    </button>
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        <footer className="modal-card-foot">
          <button
            className="button"
            onClick={() => {
              return history.goBack();
            }}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

export default ProjectDetails;
