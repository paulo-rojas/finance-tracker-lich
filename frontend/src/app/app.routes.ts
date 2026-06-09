import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/auth/pages/welcome/welcome.component').then(
        (m) => m.WelcomeComponent
      )
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(
        (m) => m.LoginComponent
      )
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register.component').then(
        (m) => m.RegisterComponent
      )
  },

  {
    path: 'app',
    loadComponent: () =>
      import('./features/layout/components/main-shell/main-shell.component').then(
        (m) => m.MainShellComponent
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          )
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/pages/user-selector/user-selector.component').then(
            (m) => m.UserSelectorComponent
          )
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./features/accounts/pages/accounts-page/accounts-page.component').then(
            (m) => m.AccountsPageComponent
          )
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./features/contacts/pages/contacts-page/contacts-page.component').then(
            (m) => m.ContactsPageComponent
          )
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import(
            './features/transactions/pages/transactions-page/transactions-page.component'
          ).then((m) => m.TransactionsPageComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'welcome' }
];
