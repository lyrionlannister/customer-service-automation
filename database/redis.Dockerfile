FROM docker.io/library/redis:7-alpine

EXPOSE 6379

CMD ["sh", "-c", "printf 'user %s on >%s ~* &* +@all\\nuser default off\\n' \"$REDIS_USER\" \"$REDIS_PASSWORD\" > /tmp/users.acl && redis-server --appendonly yes --aclfile /tmp/users.acl"]
