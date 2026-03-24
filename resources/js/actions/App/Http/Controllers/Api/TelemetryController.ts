import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\TelemetryController::store
* @see app/Http/Controllers/Api/TelemetryController.php:14
* @route '/api/telemetry'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/telemetry',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TelemetryController::store
* @see app/Http/Controllers/Api/TelemetryController.php:14
* @route '/api/telemetry'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TelemetryController::store
* @see app/Http/Controllers/Api/TelemetryController.php:14
* @route '/api/telemetry'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TelemetryController::store
* @see app/Http/Controllers/Api/TelemetryController.php:14
* @route '/api/telemetry'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TelemetryController::store
* @see app/Http/Controllers/Api/TelemetryController.php:14
* @route '/api/telemetry'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\TelemetryController::storeBatch
* @see app/Http/Controllers/Api/TelemetryController.php:30
* @route '/api/telemetry/batch'
*/
export const storeBatch = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeBatch.url(options),
    method: 'post',
})

storeBatch.definition = {
    methods: ["post"],
    url: '/api/telemetry/batch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TelemetryController::storeBatch
* @see app/Http/Controllers/Api/TelemetryController.php:30
* @route '/api/telemetry/batch'
*/
storeBatch.url = (options?: RouteQueryOptions) => {
    return storeBatch.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TelemetryController::storeBatch
* @see app/Http/Controllers/Api/TelemetryController.php:30
* @route '/api/telemetry/batch'
*/
storeBatch.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeBatch.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TelemetryController::storeBatch
* @see app/Http/Controllers/Api/TelemetryController.php:30
* @route '/api/telemetry/batch'
*/
const storeBatchForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeBatch.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TelemetryController::storeBatch
* @see app/Http/Controllers/Api/TelemetryController.php:30
* @route '/api/telemetry/batch'
*/
storeBatchForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeBatch.url(options),
    method: 'post',
})

storeBatch.form = storeBatchForm

const TelemetryController = { store, storeBatch }

export default TelemetryController