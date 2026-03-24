import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RoverTokenController::store
* @see app/Http/Controllers/RoverTokenController.php:10
* @route '/rover/token'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/rover/token',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RoverTokenController::store
* @see app/Http/Controllers/RoverTokenController.php:10
* @route '/rover/token'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RoverTokenController::store
* @see app/Http/Controllers/RoverTokenController.php:10
* @route '/rover/token'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RoverTokenController::store
* @see app/Http/Controllers/RoverTokenController.php:10
* @route '/rover/token'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RoverTokenController::store
* @see app/Http/Controllers/RoverTokenController.php:10
* @route '/rover/token'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\RoverTokenController::destroy
* @see app/Http/Controllers/RoverTokenController.php:24
* @route '/rover/token'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/rover/token',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\RoverTokenController::destroy
* @see app/Http/Controllers/RoverTokenController.php:24
* @route '/rover/token'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RoverTokenController::destroy
* @see app/Http/Controllers/RoverTokenController.php:24
* @route '/rover/token'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\RoverTokenController::destroy
* @see app/Http/Controllers/RoverTokenController.php:24
* @route '/rover/token'
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
* @see \App\Http\Controllers\RoverTokenController::destroy
* @see app/Http/Controllers/RoverTokenController.php:24
* @route '/rover/token'
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

const RoverTokenController = { store, destroy }

export default RoverTokenController