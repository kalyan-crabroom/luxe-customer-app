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
    path: 'cancel-session',
    loadChildren: () => import('./pages/cancel-session/cancel-session.module').then(m => m.CancelSessionPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'book-now',
    loadChildren: () => import('./pages/book-now/book-now.module').then(m => m.BookNowPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'add-location',
    loadChildren: () => import('./pages/add-location/add-location.module').then(m => m.AddLocationPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'guest-details',
    loadChildren: () => import('./pages/guest-details/guest-details.module').then(m => m.GuestDetailsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'guest-details2',
    loadChildren: () => import('./pages/guest-details2/guest-details2.module').then(m => m.GuestDetails2PageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'preferences',
    loadChildren: () => import('./pages/preferences/preferences.module').then(m => m.PreferencesPageModule),
  },
  {
    path: 'book-now1',
    loadChildren: () => import('./pages/book-now1/book-now1.module').then(m => m.BookNow1PageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'book-now2',
    loadChildren: () => import('./pages/book-now2/book-now2.module').then(m => m.BookNow2PageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'book-now3',
    loadChildren: () => import('./pages/book-now3/book-now3.module').then(m => m.BookNow3PageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'select-membership',
    loadChildren: () => import('./pages/select-membership/select-membership.module').then(m => m.SelectMembershipPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'checkout',
    loadChildren: () => import('./pages/checkout/checkout.module').then(m => m.CheckoutPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'new-location',
    loadChildren: () => import('./pages/new-location/new-location.module').then(m => m.NewLocationPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./pages/contact-us/contact-us.module').then(m => m.ContactUsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'about-us',
    loadChildren: () => import('./pages/about-us/about-us.module').then(m => m.AboutUsPageModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./pages/faq/faq.module').then(m => m.FaqPageModule)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./pages/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyPageModule)
  },
  {
    path: 'news',
    loadChildren: () => import('./pages/news/news.module').then(m => m.NewsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'terms-conditions',
    loadChildren: () => import('./pages/terms-conditions/terms-conditions.module').then(m => m.TermsConditionsPageModule)
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
    loadChildren: () => import('./commonpages/payment-information/payment-information.module').then(m => m.PaymentInformationPageModule),
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
    loadChildren: () => import('./pages/change-password/change-password.module').then(m => m.ChangePasswordPageModule),
    canActivate: [LoginGuard]
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
    // message-details/:id
    path: 'message-details',
    loadChildren: () => import('./pages/message-details/message-details.module').then(m => m.MessageDetailsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'add-bank-account',
    loadChildren: () => import('./pages/add-bank-account/add-bank-account.module').then(m => m.AddBankAccountPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'booking-details',
    loadChildren: () => import('./pages/booking-details/booking-details.module').then(m => m.BookingDetailsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'treatment-modal',
    loadChildren: () => import('./commonpages/treatment-modal/treatment-modal.module').then(m => m.TreatmentModalPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'complete-request-history',
    loadChildren: () => import('./pages/complete-request-history/complete-request-history.module').then(m => m.CompleteRequestHistoryPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'my-transaction',
    loadChildren: () => import('./pages/my-transaction/my-transaction.module').then(m => m.MyTransactionPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'edit-card',
    loadChildren: () => import('./pages/edit-card/edit-card.module').then(m => m.EditCardPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'emergency-contanct',
    loadChildren: () => import('./pages/emergency-contanct/emergency-contanct.module').then(m => m.EmergencyContanctPageModule)
  },
  {
    path: 'wallet',
    loadChildren: () => import('./pages/wallet/wallet.module').then(m => m.WalletPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'gift-cards',
    loadChildren: () => import('./pages/gift-cards/gift-cards.module').then(m => m.GiftCardsPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'add-gift-card',
    loadChildren: () => import('./pages/add-gift-card/add-gift-card.module').then(m => m.AddGiftCardPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'myaccount',
    loadChildren: () => import('./tab2/tab2-routing.module').then(m => m.Tab2PageRoutingModule)
  },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
