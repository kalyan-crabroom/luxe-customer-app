import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginGuard } from './guards/login.guard';
import { authGuard } from './guards/auth.guard';
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./beforeloginpage/login/login.module').then(m => m.LoginPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./beforeloginpage/reset-password/reset-password.module').then(m => m.ResetPasswordPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./beforeloginpage/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'correct-email',
    loadChildren: () => import('./beforeloginpage/correct-email/correct-email.module').then(m => m.CorrectEmailPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'create-account',
    loadChildren: () => import('./beforeloginpage/create-account/create-account.module').then(m => m.CreateAccountPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'first-time-user-tutorial',
    loadChildren: () => import('./beforeloginpage/first-time-user-tutorial/first-time-user-tutorial.module').then(m => m.FirstTimeUserTutorialPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'session-completed',
    loadChildren: () => import('./pages/session-completed/session-completed.module').then(m => m.SessionCompletedPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'selected-session',
    loadChildren: () => import('./pages/selected-session/selected-session.module').then(m => m.SelectedSessionPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'report-session',
    loadChildren: () => import('./pages/report-session/report-session.module').then(m => m.ReportSessionPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'add-licensure-and-credentials',
    loadChildren: () => import('./pages/add-licensure-and-credentials/add-licensure-and-credentials.module').then(m => m.AddLicensureAndCredentialsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./commonpages/contact-us/contact-us.module').then(m => m.ContactUsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'faq',
    loadChildren: () => import('./commonpages/faq/faq.module').then(m => m.FaqPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./commonpages/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyPageModule)
  },
  {
    path: 'terms-conditions',
    loadChildren: () => import('./commonpages/terms-conditions/terms-conditions.module').then(m => m.TermsConditionsPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./commonpages/edit-profile/edit-profile.module').then(m => m.EditProfilePageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./commonpages/notifications/notifications.module').then(m => m.NotificationsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'messages',
    loadChildren: () => import('./commonpages/messages/messages.module').then(m => m.MessagesPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'payment-information',
    loadChildren: () => import('./pages/payment-information/payment-information.module').then(m => m.PaymentInformationPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'buy-massage-or-sdd-funds',
    loadChildren: () => import('./pages/buy-massage-or-sdd-funds/buy-massage-or-sdd-funds.module').then(m => m.BuyMassageOrSddFundsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'add-debit-card',
    loadChildren: () => import('./pages/add-debit-card/add-debit-card.module').then(m => m.AddDebitCardPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'therapist-profile',
    loadChildren: () => import('./pages/therapist-profile/therapist-profile.module').then(m => m.TherapistProfilePageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'change-password',
    loadChildren: () => import('./commonpages/change-password/change-password.module').then(m => m.ChangePasswordPageModule)
  },
  {
    path: 'delete-account',
    loadChildren: () => import('./pages/delete-account/delete-account.module').then(m => m.DeleteAccountPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'book-now-first-time-client',
    loadChildren: () => import('./pages/book-now-first-time-client/book-now-first-time-client.module').then(m => m.BookNowFirstTimeClientPageModule),
    canActivate: [LoginGuard]
  },
  {
    // path: 'background-check/:signup_id',
    path: 'background-check',
    loadChildren: () => import('./beforeloginpage/background-check/background-check.module').then(m => m.BackgroundCheckPageModule),
  },
  {
    // message-details/:id
    path: 'message-details',
    loadChildren: () => import('./pages/message-details/message-details.module').then(m => m.MessageDetailsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'edit-background-check',
    loadChildren: () => import('./commonpages/edit-background-check/edit-background-check.module').then(m => m.EditBackgroundCheckPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'add-bank-account',
    loadChildren: () => import('./pages/add-bank-account/add-bank-account.module').then(m => m.AddBankAccountPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'filter',
    loadChildren: () => import('./modal/filter/filter.module').then(m => m.FilterPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'preferences',
    loadChildren: () => import('./pages/preferences/preferences.module').then(m => m.PreferencesPageModule),
  },
  {
    path: 'session-request',
    loadChildren: () => import('./pages/session-request/session-request.module').then(m => m.SessionRequestPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'cancel-session',
    loadChildren: () => import('./pages/cancel-session/cancel-session.module').then(m => m.CancelSessionPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'my-transactions',
    loadChildren: () => import('./pages/my-transactions/my-transactions.module').then(m => m.MyTransactionsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'my-reviews',
    loadChildren: () => import('./pages/my-reviews/my-reviews.module').then(m => m.MyReviewsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'report-review',
    loadChildren: () => import('./pages/report-review/report-review.module').then(m => m.ReportReviewPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'notification-settings',
    loadChildren: () => import('./commonpages/notification-settings/notification-settings.module').then(m => m.NotificationSettingsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'request-history',
    loadChildren: () => import('./pages/request-history/request-history.module').then(m => m.RequestHistoryPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'customer-profile',
    loadChildren: () => import('./pages/customer-profile/customer-profile.module').then(m => m.CustomerProfilePageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'completed-appointments',
    loadChildren: () => import('./pages/completed-appointments/completed-appointments.module').then(m => m.CompletedAppointmentsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./tab2/tab2-routing.module').then(m => m.Tab2PageRoutingModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'emergency-contanct',
    loadChildren: () => import('./pages/emergency-contanct/emergency-contanct.module').then( m => m.EmergencyContanctPageModule)
  },  {
    path: 'onboard',
    loadChildren: () => import('./beforeloginpage/onboard/onboard.module').then( m => m.OnboardPageModule)
  }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
