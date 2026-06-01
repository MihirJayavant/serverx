Run all CI checks for this repo in order and report results.

Execute these commands sequentially — stop and report the failure if any step exits non-zero:

```
deno fmt --check
deno lint
deno check
deno test
```

Then run integration tests against the live server:

```bash
# Start the server in the background
deno task user-api &
SERVER_PID=$!

# Wait until port 3100 is accepting connections (max 15s)
for i in $(seq 1 15); do
  curl -sf http://127.0.0.1:3100/healthcheck > /dev/null 2>&1 && break
  sleep 1
done

# Run integration tests
deno task test:api
TEST_EXIT=$?

# Shut down the server
kill $SERVER_PID 2>/dev/null

exit $TEST_EXIT
```

For each step, report: pass or fail, and on failure show the relevant error output so it can be fixed immediately.
