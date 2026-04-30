import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import token from './token'
import stream9fa923 from './stream'
/**
* @see \App\Http\Controllers\RoverController::create
* @see app/Http/Controllers/RoverController.php:15
* @route '/rover/setup'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/rover/setup',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RoverController::create
* @see app/Http/Controllers/RoverController.php:15
* @route '/rover/setup'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RoverController::create
* @see app/Http/Controllers/RoverController.php:15
* @route '/rover/setup'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RoverController::create
* @see app/Http/Controllers/RoverController.php:15
* @route '/rover/setup'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RoverController::create
* @see app/Http/Controllers/RoverController.php:15
* @route '/rover/setup'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RoverController::create
* @see app/Http/Controllers/RoverController.php:15
* @route '/rover/setup'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RoverController::create
* @see app/Http/Controllers/RoverController.php:15
* @route '/rover/setup'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\RoverController::store
* @see app/Http/Controllers/RoverController.php:24
* @route '/rover'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/rover',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RoverController::store
* @see app/Http/Controllers/RoverController.php:24
* @route '/rover'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RoverController::store
* @see app/Http/Controllers/RoverController.php:24
* @route '/rover'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RoverController::store
* @see app/Http/Controllers/RoverController.php:24
* @route '/rover'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RoverController::store
* @see app/Http/Controllers/RoverController.php:24
* @route '/rover'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\RoverController::edit
* @see app/Http/Controllers/RoverController.php:31
* @route '/rover/settings'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/rover/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RoverController::edit
* @see app/Http/Controllers/RoverController.php:31
* @route '/rover/settings'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RoverController::edit
* @see app/Http/Controllers/RoverController.php:31
* @route '/rover/settings'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RoverController::edit
* @see app/Http/Controllers/RoverController.php:31
* @route '/rover/settings'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RoverController::edit
* @see app/Http/Controllers/RoverController.php:31
* @route '/rover/settings'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RoverController::edit
* @see app/Http/Controllers/RoverController.php:31
* @route '/rover/settings'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RoverController::edit
* @see app/Http/Controllers/RoverController.php:31
* @route '/rover/settings'
*/
editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\RoverController::update
* @see app/Http/Controllers/RoverController.php:43
* @route '/rover'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/rover',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\RoverController::update
* @see app/Http/Controllers/RoverController.php:43
* @route '/rover'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RoverController::update
* @see app/Http/Controllers/RoverController.php:43
* @route '/rover'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\RoverController::update
* @see app/Http/Controllers/RoverController.php:43
* @route '/rover'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RoverController::update
* @see app/Http/Controllers/RoverController.php:43
* @route '/rover'
*/
updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\RoverController::destroy
* @see app/Http/Controllers/RoverController.php:54
* @route '/rover'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/rover',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\RoverController::destroy
* @see app/Http/Controllers/RoverController.php:54
* @route '/rover'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RoverController::destroy
* @see app/Http/Controllers/RoverController.php:54
* @route '/rover'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\RoverController::destroy
* @see app/Http/Controllers/RoverController.php:54
* @route '/rover'
*/
const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RoverController::destroy
* @see app/Http/Controllers/RoverController.php:54
* @route '/rover'
*/
destroyForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\StreamController::stream
* @see app/Http/Controllers/StreamController.php:44
* @route '/rover/stream'
*/
export const stream = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stream.url(options),
    method: 'get',
})

stream.definition = {
    methods: ["get","head"],
    url: '/rover/stream',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StreamController::stream
* @see app/Http/Controllers/StreamController.php:44
* @route '/rover/stream'
*/
stream.url = (options?: RouteQueryOptions) => {
    return stream.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StreamController::stream
* @see app/Http/Controllers/StreamController.php:44
* @route '/rover/stream'
*/
stream.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stream.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StreamController::stream
* @see app/Http/Controllers/StreamController.php:44
* @route '/rover/stream'
*/
stream.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stream.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StreamController::stream
* @see app/Http/Controllers/StreamController.php:44
* @route '/rover/stream'
*/
const streamForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stream.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StreamController::stream
* @see app/Http/Controllers/StreamController.php:44
* @route '/rover/stream'
*/
streamForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stream.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StreamController::stream
* @see app/Http/Controllers/StreamController.php:44
* @route '/rover/stream'
*/
streamForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: stream.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

stream.form = streamForm

const rover = {
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    token: Object.assign(token, token),
    stream: Object.assign(stream, stream9fa923),
}

export default rover