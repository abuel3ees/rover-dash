import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MessagePinController::store
* @see app/Http/Controllers/MessagePinController.php:14
* @route '/messaging/conversations/{conversation}/messages/{message}/pin'
*/
export const store = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/messaging/conversations/{conversation}/messages/{message}/pin',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MessagePinController::store
* @see app/Http/Controllers/MessagePinController.php:14
* @route '/messaging/conversations/{conversation}/messages/{message}/pin'
*/
store.url = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
            message: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: typeof args.conversation === 'object'
        ? args.conversation.id
        : args.conversation,
        message: typeof args.message === 'object'
        ? args.message.id
        : args.message,
    }

    return store.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MessagePinController::store
* @see app/Http/Controllers/MessagePinController.php:14
* @route '/messaging/conversations/{conversation}/messages/{message}/pin'
*/
store.post = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MessagePinController::store
* @see app/Http/Controllers/MessagePinController.php:14
* @route '/messaging/conversations/{conversation}/messages/{message}/pin'
*/
const storeForm = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MessagePinController::store
* @see app/Http/Controllers/MessagePinController.php:14
* @route '/messaging/conversations/{conversation}/messages/{message}/pin'
*/
storeForm.post = (args: { conversation: number | { id: number }, message: number | { id: number } } | [conversation: number | { id: number }, message: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

const MessagePinController = { store }

export default MessagePinController