SELECT format('CREATE DATABASE %I', 'demo-social-media')
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'demo-social-media'
)\gexec

SELECT format('CREATE DATABASE %I', 'demo-api-store')
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'demo-api-store'
)\gexec

SELECT format('CREATE DATABASE %I', 'demo-job-board')
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'demo-job-board'
)\gexec
