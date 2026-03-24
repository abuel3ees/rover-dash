import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\RoverStatusController::update
* @see app/Http/Controllers/Api/RoverStatusController.php:31
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
* @see app/Http/Controllers/Api/RoverStatusController.php:31
* @route '/api/rover/status'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RoverStatusController::update
* @see app/Http/Controllers/Api/RoverStatusController.php:31
* @route '/api/rover/status'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\RoverStatusController::update
* @see app/Http/Controllers/Api/RoverStatusController.php:31
* @route '/api/rover/status'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\RoverStatusController::update
* @see app/Http/Controllers/Api/RoverStatusController.php:31
* @route '/api/rover/status'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

const RoverStatusController = { update }

export default RoverStatusController