import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import whisper from './whisper'
/**
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:30
* @route '/chat'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:30
* @route '/chat'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:30
* @route '/chat'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:30
* @route '/chat'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:30
* @route '/chat'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const chat = {
    store: Object.assign(store, store),
    whisper: Object.assign(whisper, whisper),
}

export default chat