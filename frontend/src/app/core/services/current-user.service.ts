import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, switchMap, timeout } from 'rxjs';

import { User } from '../../features/users/models/user.model';
import { UserService } from '../../features/users/services/user.service';

const CURRENT_USER = {
  fullName: 'Paulo Rojas',
  email: 'paulo1rojas2@gmail.com',
  passwordHash: '1834'
};

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private currentUser$?: Observable<User>;

  constructor(private readonly userService: UserService) {}

  getCurrentUser(): Observable<User> {
    this.currentUser$ ??= this.resolveDefaultUser().pipe(
      timeout(8000),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    return this.currentUser$;
  }

  private resolveDefaultUser(): Observable<User> {
    return this.userService.getUsers().pipe(
      switchMap((users) => {
        const existing =
          users.find((user) => user.email === CURRENT_USER.email) ?? users[0];

        if (existing) {
          return of(existing);
        }

        return this.userService.createUser(CURRENT_USER).pipe(
          catchError(() =>
            this.userService.getUsers().pipe(
              map((retryUsers) => {
                const retryUser = retryUsers.find(
                  (user) => user.email === CURRENT_USER.email
                );

                if (!retryUser) {
                  throw new Error('No se pudo resolver el usuario actual.');
                }

                return retryUser;
              })
            )
          )
        );
      })
    );
  }
}
