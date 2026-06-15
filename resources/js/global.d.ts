import type Echo from 'laravel-echo';
import type { AxiosInstance } from 'axios';

declare global {
    interface Window {
        axios: AxiosInstance;
        Echo: Echo;
        Pusher: unknown;
    }
}
