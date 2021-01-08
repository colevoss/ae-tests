#!/bin/bash

DEPLOY_ENV=$1

if [[ -z $DEPLOY_ENV ]]; then
  echo "Provide an environment argument of \"staging\" or \"production\""
  exit 1
fi

if [[ $DEPLOY_ENV != "production" && $DEPLOY_ENV != "staging" ]]; then
  echo "provide an environment argument of \"staging\" or \"production\""
  exit 1
fi

if [[ $CI != true ]]; then
  echo "Not in CI envrionment. Cannot prepare app deployment"
  exit 1
fi

APP_YAML_FILENAME="app-$DEPLOY_ENV-deployment.yaml"

echo "Preparing $APP_YAML_FILENAME"
(echo "cat <<EOF"; cat app.yaml; echo "EOF";) | bash | tee $APP_YAML_FILENAME