import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\RoverStatusController::heartbeat
* @see app/Http/Controllers/Api/RoverStatusController.php:13
* @route '/api/rover/heartbeat'
*/
export const heartbeat = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: heartbeat.url(options),
    method: 'post',
})

heartbeat.definition = {
    methods: ["post"],
    url: '/api/rover/heartbeat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RoverStatusController::heartbeat
* @see app/Http/Controllers/Api/RoverStatusController.php:13
* @route '/api/rover/heartbeat'
*/
heartbeat.url = (options?: RouteQueryOptions) => {
    return heartbeat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RoverStatusController::heartbeat
* @see app/Http/Controllers/Api/RoverStatusController.php:13
* @route '/api/rover/heartbeat'
*/
heartbeat.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: heartbeat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\RoverStatusController::heartbeat
* @see app/Http/Controllers/Api/RoverStatusController.php:13
* @route '/api/rover/heartbeat'
*/
const heartbeatForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: heartbeat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\RoverStatusController::heartbeat
* @see app/Http/Controllers/Api/RoverStatusController.php:13
* @route '/api/rover/heartbeat'
*/
heartbeatForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: heartbeat.url(options),
    method: 'post',
})

heartbeat.form = heartbeatForm

/**
* @see \App\Http\Controllers\Api\RoverStatusController::update
* @see app/Http/Controllers/Api/RoverStatusController.php:45
* @route '/api/rover/status'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/api/rover/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RoverStatusController::update
* @see app/Http/Controllers/Api/RoverStatusController.php:45
* @route '/api/rover/status'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RoverStatusController::update
* @see app/Http/Controllers/Api/RoverStatusController.php:45
* @route '/api/rover/status'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\RoverStatusController::update
* @see app/Http/Controllers/Api/RoverStatusController.php:45
* @route '/api/rover/status'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\RoverStatusController::update
* @see app/Http/Controllers/Api/RoverStatusController.php:45
* @route '/api/rover/status'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

const RoverStatusController = { heartbeat, update }

export default RoverStatusController