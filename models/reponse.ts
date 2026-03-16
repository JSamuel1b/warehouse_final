export interface iResponse<T> {
    succeded: boolean;
    message: string | null;
    errors: string[] | null;
    data: T | null;
}