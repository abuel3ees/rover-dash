import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\StreamController::health
* @see app/Http/Controllers/StreamController.php:17
* @route '/rover/stream/health'
*/
export const health = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

health.definition = {
    methods: ["get","head"],
    url: '/rover/stream/health',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StreamController::health
* @see app/Http/Controllers/StreamController.php:17
* @route '/rover/stream/health'
*/
health.url = (options?: RouteQueryOptions) => {
    return health.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StreamController::health
* @see app/Http/Controllers/StreamController.php:17
* @route '/rover/stream/health'
*/
health.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StreamController::health
* @see app/Http/Controllers/StreamController.php:17
* @route '/rover/stream/health'
*/
health.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: health.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StreamController::health
* @see app/Http/Controllers/StreamController.php:17
* @route '/rover/stream/health'
*/
const healthForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: health.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StreamController::health
* @see app/Http/Controllers/StreamController.php:17
* @route '/rover/stream/health'
*/
healthForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: health.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StreamController::health
* @see app/Http/Controllers/StreamController.php:17
* @route '/rover/stream/health'
*/
healthForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: health.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

health.form = healthForm

const stream = {
    health: Object.assign(health, health),
}

export default stream