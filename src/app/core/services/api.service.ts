import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

/**
 * API Service
 * Centralized service for all HTTP requests to the backend
 */
type HttpOptions = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Performs a GET request to the API.
   * @param endpoint - Path relative to apiUrl (e.g. 'reviews', 'reviews/1')
   * @param options - Optional HttpClient options (e.g. { params: { page: 1 } })
   * @returns Observable of the response body
   */
  get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, options);
  }

  /**
   * Performs a POST request to the API.
   * @param endpoint - Path relative to apiUrl
   * @param data - Request body
   * @param options - Optional HttpClient options
   * @returns Observable of the response body
   */
  post<T>(endpoint: string, data: unknown, options?: HttpOptions): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, options);
  }

  /**
   * Performs a PUT request to the API.
   * @param endpoint - Path relative to apiUrl (e.g. 'reviews/1')
   * @param data - Request body
   * @param options - Optional HttpClient options
   * @returns Observable of the response body
   */
  put<T>(endpoint: string, data: unknown, options?: HttpOptions): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, options);
  }

  /**
   * Performs a PATCH request to the API.
   * @param endpoint - Path relative to apiUrl
   * @param data - Request body (partial)
   * @param options - Optional HttpClient options
   * @returns Observable of the response body
   */
  patch<T>(endpoint: string, data: unknown, options?: HttpOptions): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, data, options);
  }

  /**
   * Performs a DELETE request to the API.
   * @param endpoint - Path relative to apiUrl (e.g. 'reviews/1')
   * @param options - Optional HttpClient options
   * @returns Observable of the response body
   */
  delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, options);
  }
}

