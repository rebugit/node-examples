#!/usr/bin/env sh

export AWS_ACCESS_KEY_ID=$(sed -nr "/^\[default\]/ { :l /^aws_access_key_id[ ]*=/ { s/.*=[ ]*//; p; q;}; n; b l;}" ~/.aws/credentials)
export AWS_SECRET_ACCESS_KEY=$(sed -nr "/^\[default\]/ { :l /^aws_secret_access_key[ ]*=/ { s/.*=[ ]*//; p; q;}; n; b l;}" ~/.aws/credentials)

docker-compose up --build --remove-orphans