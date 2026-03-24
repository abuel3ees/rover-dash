import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TelemetryWebController::index
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/telemetry',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TelemetryWebController::index
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TelemetryWebController::index
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TelemetryWebController::index
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TelemetryWebController::index
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TelemetryWebController::index
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TelemetryWebController::index
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

const TelemetryWebController = { index }

export default TelemetryWebController