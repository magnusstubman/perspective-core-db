# perspective-api
A simple task manager for agile software development. 

This is perspective's api component. If you're not familiar with perspective, you should check out the [perspective client repo](https://github.com/perspective/perspective-client) first.

Alpha quality for now - work in progress!

## Usage
1. Install node.js (tested on 0.10.2) and RethinkDB (tested on 1.9.0)
2. `npm install`
3. Install desired plugins from `perspective-<pluginrepo>` (not implemented yet)
4. Start RethinkDB server with `rethinkdb`
5. Start the server with `perspective-api`
6. Access API via `http://localhost:8888/tasks`
7. Looking for a front-end? Checkout the [perspective client repo](https://github.com/perspective/perspective-client)

Want a UI? Go visit the [perspective client repo](https://github.com/perspective/perspective-client)

## Plugin architecture
Work in progress - see [docs/plugins.md](docs/plugins.md)



License
-------

MIT