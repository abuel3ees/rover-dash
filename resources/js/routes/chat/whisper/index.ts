import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\WhisperController::store
* @see app/Http/Controllers/WhisperController.php:12
* @route '/chat/whisper'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/chat/whisper',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WhisperController::store
* @see app/Http/Controllers/WhisperController.php:12
* @route '/chat/whisper'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WhisperController::store
* @see app/Http/Controllers/WhisperController.php:12
* @route '/chat/whisper'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WhisperController::store
* @see app/Http/Controllers/WhisperController.php:12
* @route '/chat/whisper'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WhisperController::store
* @see app/Http/Controllers/WhisperController.php:12
* @route '/chat/whisper'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const whisper = {
    store: Object.assign(store, store),
}

export default whisper