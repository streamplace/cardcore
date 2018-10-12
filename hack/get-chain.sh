#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

current="https://cardco.re/$1/next"
echo "" > "$1"

while true; do
  echo "getting $current"
  result="$(curl -q $current)"
  echo $result | jq '.'
  echo $result >> "$1"
  current="https://cardco.re/$(echo $result | jq -r '.next')/next"
  sleep 1
done