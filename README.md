# SERVICE

## Getting Started

To run this project locally along with its external dependencies (Databases, Event Brokers), you will
need to have Docker installed. You can do that by downloading and installing it from the [Docker website](https://www.docker.com/products/docker-desktop).

## Starting Service

Using Docker Compose, the service can be started in a couple different ways.

### Up

```bash
npm run up
```

Using `npm run up` will use [docker-compose](https://docs.docker.com/compose/) to start all services.
See the documentation for [`docker-compose up`](https://docs.docker.com/compose/reference/up/) for more details.

In short, this command will start all services and expose the app service at [localhost:8080](http://localhost:8080).

#### Background Mode

```bash
npm run up:background
```

This command will start the service and dependencies like `npm run up` but will exit after the containers
are started and running allowing you to continue to use that terminal session. This uses `docker-compose`'s
`--detach` flag. If you need to see the logs for the service or other running containers, run the following
from the this repo's directory.

```bash
npm run logs
```

#### Force Build

```bash
npm run up:build
```

This command will force Docker Compose to rebuild all containers before starting them. This might be
useful if you have made changes since the last time you up'd the service and the changes aren't being
picked up. The `--build` flag isn't used in the `npm run up` command to make that command quicker for
the average use.

### Down

To stop (or force stop) all running containers in this project, run `npm run down`. If you aren't running
the service in background mode, using `Ctrl + C` in the running terminal session will attempt to stop
all running containers.

## Development

When running the application with `npm run up` (or its variants), making changes and saving the source
code will live reload the server in the container, allowing you to really speed along in your cool feature
development or bug squashing. Go get 'em, Speed Racer!

### Debugging

When running the service in any mode (background or foreground), you can attach a debugger on port `9229`
and use some nice debugging features.

This repo contains a [VSCode Debugging Command](/.vscode/launch.json) that, when used, will allow you
to do things like set break points, step through the code, and inspect local variables.

To use this functionality, press `F5` while in VSCode or navigate to the `Run` menu in the sidebar and
click the Play button at the top next to `Attach App`

## Deployment

This Project is hosted in Google App Engine. Ideally you cannot deploy any code to App Engine from a
local machine, and will need to rely on our CI/CD pipelines set up in Github Actions.

### Pull Requests

When a pull request is merged to the `main` branch, a Github Action is started and will build the app,
run tests* and deploy that version of the application to the Staging environment in App Engine

### Manual Staging Deploy

You can manually deploy a branch to staging by using the `Run Workflow` button for the [Deploy To Staging](https://github.com/colevoss/ae-tests/actions?query=workflow%3A%22Deploy+To+Staging%22) workflow and choosing the branch to deploy.

### Manual Production Deploy

At this time, all deployments to production are done manually through our Github Actions. Much like the
Deploy To Staging workflow, using the [Deploy To Production](https://github.com/colevoss/ae-tests/actions?query=workflow%3A%22Deploy+To+Production%22) workflow will deploy to Production. Although the `Run Workflow` prompt gives you the
option to select a branch to deploy, selecting any branch other than `main` will fail the workflow and
not allow you to deploy. 

## References

* [Docker](https://docs.docker.com/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop)
* [Docker Compose](https://docs.docker.com/compose/)
* [VSCode Debugger](https://code.visualstudio.com/docs/editor/debugging)
* [Google App Engine](https://cloud.google.com/appengine/docs/standard/nodejs)