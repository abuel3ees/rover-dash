import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\HlsController::store
* @see app/Http/Controllers/Api/HlsController.php:17
* @route '/api/rover/hls/{filename}'
*/
export const store = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/rover/hls/{filename}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\HlsController::store
* @see app/Http/Controllers/Api/HlsController.php:17
* @route '/api/rover/hls/{filename}'
*/
store.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    if (Array.isArray(args)) {
        args = {
            filename: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        filename: args.filename,
    }

    return store.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\HlsController::store
* @see app/Http/Controllers/Api/HlsController.php:17
* @route '/api/rover/hls/{filename}'
*/
store.post = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\HlsController::store
* @see app/Http/Controllers/Api/HlsController.php:17
* @route '/api/rover/hls/{filename}'
*/
const storeForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\HlsController::store
* @see app/Http/Controllers/Api/HlsController.php:17
* @route '/api/rover/hls/{filename}'
*/
storeForm.post = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\HlsController::show
* @see app/Http/Controllers/Api/HlsController.php:55
* @route '/rover/hls/{filename}'
*/
export const show = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/rover/hls/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\HlsController::show
* @see app/Http/Controllers/Api/HlsController.php:55
* @route '/rover/hls/{filename}'
*/
show.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    if (Array.isArray(args)) {
        args = {
            filename: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        filename: args.filename,
    }

    return show.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\HlsController::show
* @see app/Http/Controllers/Api/HlsController.php:55
* @route '/rover/hls/{filename}'
*/
show.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\HlsController::show
* @see app/Http/Controllers/Api/HlsController.php:55
* @route '/rover/hls/{filename}'
*/
show.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\HlsController::show
* @see app/Http/Controllers/Api/HlsController.php:55
* @route '/rover/hls/{filename}'
*/
const showForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\HlsController::show
* @see app/Http/Controllers/Api/HlsController.php:55
* @route '/rover/hls/{filename}'
*/
showForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\HlsController::show
* @see app/Http/Controllers/Api/HlsController.php:55
* @route '/rover/hls/{filename}'
*/
showForm.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const HlsController = { store, show }

export default HlsController