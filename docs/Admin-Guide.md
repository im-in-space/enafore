Admin Guide
====

This guide is for instance admins who may be having trouble with Enafore compatibility.

By default, [Mastodon allows cross-origin access to the `/api` endpoint](https://github.com/tootsuite/mastodon/blob/50529cbceb84e611bca497624a7a4c38113e5135/config/initializers/cors.rb#L15-L20). Thus Enafore should "just work" for most Mastodon servers.

If the nginx/Apache settings have been changed, though, then Enafore might not be able to connect to an instance. To check if the instance is supported, run this command (replacing `myinstance.com` with your instance URL):

```bash
curl -sLv -H 'Origin: https://enafore.social' -o /dev/null \
  myinstance.com/api/v1/instance
```

If you see this in the output:

```
Access-Control-Allow-Origin: *
```

Then Enafore should work as expected!

Otherwise, if the instance admin would like to whitelist only certain websites (including Enafore) to work with CORS, then they will need to make sure that the server echoes:

```
Access-Control-Allow-Origin: https://pinafore.easrng.net
```

when Enafore tries to access it. Note that this is a bit complicated to configure (compared to the simpler `*` approach), but [there are instructions on StackOverflow](https://stackoverflow.com/q/1653308) for nginx, Apache, and other servers.
