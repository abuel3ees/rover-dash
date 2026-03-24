import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

login.form = loginForm

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

logout.form = logoutForm

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
export const register = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

register.definition = {
    methods: ["get","head"],
    url: '/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: register.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
registerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
registerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

register.form = registerForm

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

home.form = homeForm

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:14
* @route '/dashboard'
*/
dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dashboard.form = dashboardForm

/**
* @see \App\Http\Controllers\ControlController::control
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
export const control = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: control.url(options),
    method: 'get',
})

control.definition = {
    methods: ["get","head"],
    url: '/control',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ControlController::control
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
control.url = (options?: RouteQueryOptions) => {
    return control.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ControlController::control
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
control.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: control.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ControlController::control
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
control.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: control.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ControlController::control
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
const controlForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: control.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ControlController::control
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
controlForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: control.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ControlController::control
* @see app/Http/Controllers/ControlController.php:15
* @route '/control'
*/
controlForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: control.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

control.form = controlForm

/**
* @see \App\Http\Controllers\TelemetryWebController::telemetry
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
export const telemetry = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: telemetry.url(options),
    method: 'get',
})

telemetry.definition = {
    methods: ["get","head"],
    url: '/telemetry',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TelemetryWebController::telemetry
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
telemetry.url = (options?: RouteQueryOptions) => {
    return telemetry.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TelemetryWebController::telemetry
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
telemetry.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: telemetry.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TelemetryWebController::telemetry
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
telemetry.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: telemetry.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TelemetryWebController::telemetry
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
const telemetryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: telemetry.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TelemetryWebController::telemetry
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
telemetryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: telemetry.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TelemetryWebController::telemetry
* @see app/Http/Controllers/TelemetryWebController.php:12
* @route '/telemetry'
*/
telemetryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: telemetry.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

telemetry.form = telemetryForm

/**
* @see \App\Http\Controllers\ChatController::chat
* @see app/Http/Controllers/ChatController.php:15
* @route '/chat'
*/
export const chat = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: chat.url(options),
    method: 'get',
})

chat.definition = {
    methods: ["get","head"],
    url: '/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::chat
* @see app/Http/Controllers/ChatController.php:15
* @route '/chat'
*/
chat.url = (options?: RouteQueryOptions) => {
    return chat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::chat
* @see app/Http/Controllers/ChatController.php:15
* @route '/chat'
*/
chat.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: chat.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::chat
* @see app/Http/Controllers/ChatController.php:15
* @route '/chat'
*/
chat.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: chat.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::chat
* @see app/Http/Controllers/ChatController.php:15
* @route '/chat'
*/
const chatForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: chat.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::chat
* @see app/Http/Controllers/ChatController.php:15
* @route '/chat'
*/
chatForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: chat.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::chat
* @see app/Http/Controllers/ChatController.php:15
* @route '/chat'
*/
chatForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: chat.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

chat.form = chatForm
