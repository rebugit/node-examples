#!/bin/bash

JSON_BASEPATH="${HOME}/.aws/cli/cache"
json_file=$(ls -tr "${JSON_BASEPATH}" | tail -n1)
export AWS_ACCESS_KEY_ID=$(cat ${JSON_BASEPATH}/${json_file} | jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(cat ${JSON_BASEPATH}/${json_file} | jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(cat ${JSON_BASEPATH}/${json_file} | jq -r '.Credentials.SessionToken')

aws sts get-caller-identity > /dev/null;

docker-compose up --build --remove-orphans