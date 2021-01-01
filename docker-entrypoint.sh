#!/bin/bash

npx prisma migrate deploy --preview-feature
exec "$@"