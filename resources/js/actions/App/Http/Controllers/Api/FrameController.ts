import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\FrameController::store
* @see app/Http/Controllers/Api/FrameController.php:14
* @route '/api/rover/frame'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/rover/frame',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\FrameController::store
* @see app/Http/Controllers/Api/FrameController.php:14
* @route '/api/rover/frame'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\FrameController::store
* @see app/Http/Controllers/Api/FrameController.php:14
* @route '/api/rover/frame'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\FrameController::store
* @see app/Http/Controllers/Api/FrameController.php:14
* @route '/api/rover/frame'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\FrameController::store
* @see app/Http/Controllers/Api/FrameController.php:14
* @route '/api/rover/frame'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const FrameController = { store }

export default FrameController