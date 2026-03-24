import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\StreamController::proxy
* @see app/Http/Controllers/StreamController.php:10
* @route '/rover/stream'
*/
export const proxy = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: proxy.url(options),
    method: 'get',
})

proxy.definition = {
    methods: ["get","head"],
    url: '/rover/stream',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StreamController::proxy
* @see app/Http/Controllers/StreamController.php:10
* @route '/rover/stream'
*/
proxy.url = (options?: RouteQueryOptions) => {
    return proxy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StreamController::proxy
* @see app/Http/Controllers/StreamController.php:10
* @route '/rover/stream'
*/
proxy.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: proxy.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StreamController::proxy
* @see app/Http/Controllers/StreamController.php:10
* @route '/rover/stream'
*/
proxy.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: proxy.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StreamController::proxy
* @see app/Http/Controllers/StreamController.php:10
* @route '/rover/stream'
*/
const proxyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: proxy.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StreamController::proxy
* @see app/Http/Controllers/StreamController.php:10
* @route '/rover/stream'
*/
proxyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: proxy.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StreamController::proxy
* @see app/Http/Controllers/StreamController.php:10
* @route '/rover/stream'
*/
proxyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: proxy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

proxy.form = proxyForm

const StreamController = { proxy }

export default StreamController