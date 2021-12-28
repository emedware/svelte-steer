# svelte-lazy-router

As there is curently no dedicated nor even suitable router for svelte, and as we needed a powerful and flexible one, we decided to make one and make it a dedicated package.

## Installation / usage

```sh
npm i -S svelte-lazy-router
```

```typescript
import { Router, Link, link } from "svelte-lazy-router";
const router = <Writable<Routing>>getContext('router');
----
$:    myLink = $router.link('user', {id: 42});
----
$:    myLink = $router.link('/user/42');  // Don't laugh - if we are in a nested router, this might become `/en/user/42` or `/de/user/42` depending of the parent router
```

```html
<Router {routes} >
    ...
    <Link route="user" parms={{id: 42}}>  <!-- named route -->
    ----
    <Link route="/user/42">  <!-- url path -->
    ...
    <Route>404</Route>
    ...
</Router>
```

### Main difference with common routers

The `Router` object contains only the state of the routing. On the HTML generation level, it just forwards the content. All routing-related activity/elements (`Route`, `Link`, `getContext('router')`).

The `Route` element effectively displays the selected route.

## Elements

### `Router`

#### Properties

`routes`
: Gives the `Route[]` tree of routes to serve

`history`
: Choose a history mode. Two modes are defined by default.
- `H5History` uses the Html5 history mode : `http://mysite/my/route/path`
- `HashHistory` uses the hash as history mode : `http://mysite#/my/route/path`

By default, `H5History` is used.

```html
<Router history={HashHistory} ...>
...
</Router>
<script lang="ts">
    import { HashHistory } from "svelte-lazy-router";
    ...
</script>
```

### `Route`

#### Slot

The slot is displayed if no route is found. The `error` value can be used to display more information.

#### Events

`loading`
: Called with a boolean value to signal its loading state (true when waiting a lazy-load)

`error`
: Set (or unset if value is `undefined`) the route-related error. In error state, the slot

### Link

#### Properties

`route`
: Either the path (begins with a '/') or the name of the route to point to

`params`
: If a route name is provided, this is the dictionary of the properties to give.

## Annex: Structures

### Routing

When in a router, the context `"router"` is the store containing these informations :

```ts
interface Routing {
    link(path: string | RouteMatch, props?: Dictionary): string;
    match(path: string, props?: Dictionary, nested?: RouteMatch): RouteMatch;
    navigate(path: string, props?: Dictionary, push: boolean = true);
    replace(path: string, props?: Dictionary);
    go(delta: number);
    readonly route: RouteMatch;
    readonly path: string;
    readonly error?: any;
}
```

Example:

```ts
let router = (Readable<Routing>)getContext('router');

$router.navigate('/new/url');
```

### Lazy

A lazy something (aka `Lazy<T>`) is either a something (a `T`), a callback (returning a `Lazy<T>`) or a promise (of `Lazy<T>`).
It can be a callback returning a promise of a callback of - freedom! At the end of the chain, though, some `T` will be retrieved.

### Route definition

```ts
interface Route {
  name?: string;
  path: string;
  component?: Lazy<SvelteComponent>;
  nested?: Route[]
}
```

- `name` is only used to refer to this route by its name. Some function can take the name of a route to refer to it.
- `path` refer to the whole path of the route. Each part begining with a `:` defines a parameter (like every router: `/user/:id`)
- `component` is the component to display (lazy-loaded). Optional: if there are nested routes, not specifying a component is
 equivalent to specify a component containing only `<Router />` and hence displaying directly the nested route.
- `nested` is an array (lazy-loaded) of nested routes.

### Route match

```ts
interface RouteMatch {
  spec: RouteSpec;
  parent?: RouteMatch;
  nested?: RouteMatch;
  props: Dictionary<any>;
}
```

- `spec` gives all the indication of the generic route (without match)
- `parent` and `nested` give both the match of the parent and nested route (if any)
- `props` contains all the parameters given to the route. The prototype of this object are the parameters given to the parent route (chained)

## Nesting

A router routes is defined with an array of `Route` : `<Router {routes}>` - Except when it is a nested router. Nesting can be done in two ways, illustrated here : available routes are `a/c`, `a/d`, `b/c`, `b/d`.

`index.svelte`

```html
<script>
  import { Router } from "svelte-lazy-router";
  import A from "./a.svelte";
  import B from "./b.svelte";
  import C from "./c.svelte";
  import D from "./d.svelte";

  let routes = [{
    path: 'a',
    component: A,
    nested: [{
      path: 'c', component: C
    }, {
      path: 'd', component: D
    }]
  }, {
    path: 'b',
    component: B
  }]
</script>
<Router {routes}><Route/></Router>
```

There are two ways to define routes - if both are used, the routes are cumulated

`a.svelte`

```html
<script>
  import { Router } from "svelte-lazy-router";
</script>
a/ ... <Route />
```

`b.svelte`

```html
<script>
  import { Router } from "svelte-lazy-router";
  import C from "./c.svelte";
  import D from "./d.svelte";

  let routes = [{
    path: 'c', component: C
  }, {
    path: 'd', component: D
  }]
</script>
b/ ... <Router {routes}><Route /></Router>
```