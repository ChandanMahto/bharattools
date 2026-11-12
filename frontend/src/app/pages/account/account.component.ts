import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountService, SavedCalculation } from '../../core/account.service';
import { formatINR, formatIndianNumber } from '../../core/format';

@Component({
  selector: 'bt-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="tool-page account-page">
      <a class="back-link" routerLink="/">← All tools</a>

      <div class="eyebrow">OPTIONAL ACCOUNT</div>
      <h1>Your saved calculations</h1>

      <p class="tool-intro">
        Calculations are never saved automatically. Sign in to save only the results you choose.
        Guest calculations remain on this device in memory only.
      </p>

      @if (!account.signedIn) {
        <div class="calculator-panel account-panel">
          <div class="segmented">
            <button type="button" [class.active]="mode === 'login'" (click)="switchMode('login')">
              Sign in
            </button>

            <button
              type="button"
              [class.active]="mode === 'register'"
              (click)="switchMode('register')"
            >
              Create account
            </button>
          </div>

          <form #accountForm="ngForm" (ngSubmit)="submit(accountForm)" novalidate>
            <!-- Email -->
            <div class="validation-field">
              <label class="field-label" for="account-email"> Email address </label>

              <input
                id="account-email"
                class="account-input"
                [class.input-invalid]="emailControl.invalid && (emailControl.touched || submitted)"
                type="email"
                name="email"
                [(ngModel)]="email"
                #emailControl="ngModel"
                autocomplete="email"
                placeholder="you@example.com"
                required
                email
                maxlength="320"
                [attr.aria-invalid]="emailControl.invalid && (emailControl.touched || submitted)"
                aria-describedby="email-error"
              />

              @if (emailControl.invalid && (emailControl.touched || submitted)) {
                <div class="validation-error" id="email-error">
                  @if (emailControl.errors?.['required']) {
                    Email address is required.
                  } @else if (emailControl.errors?.['email']) {
                    Enter a valid email address.
                  } @else if (emailControl.errors?.['maxlength']) {
                    Email address cannot exceed 320 characters.
                  }
                </div>
              }
            </div>

            <!-- Password -->
            <div class="validation-field">
              <label class="field-label" for="account-password"> Password </label>

              <div class="password-input-wrapper">
                <input
                  id="account-password"
                  class="account-input"
                  [class.input-invalid]="
                    passwordControl.invalid && (passwordControl.touched || submitted)
                  "
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  #passwordControl="ngModel"
                  [attr.autocomplete]="mode === 'login' ? 'current-password' : 'new-password'"
                  placeholder="Enter your password"
                  required
                  minlength="10"
                  maxlength="72"
                  [attr.aria-invalid]="
                    passwordControl.invalid && (passwordControl.touched || submitted)
                  "
                  aria-describedby="password-error"
                />

                <button
                  type="button"
                  class="password-toggle"
                  (click)="showPassword = !showPassword"
                  [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>

              @if (passwordControl.invalid && (passwordControl.touched || submitted)) {
                <div class="validation-error" id="password-error">
                  @if (passwordControl.errors?.['required']) {
                    Password is required.
                  } @else if (passwordControl.errors?.['minlength']) {
                    Password must contain at least 10 characters.
                  } @else if (passwordControl.errors?.['maxlength']) {
                    Password cannot exceed 72 characters.
                  }
                </div>
              }

              @if (mode === 'register') {
                <p class="field-hint">
                  Use 10–72 characters. Your password is stored as a one-way BCrypt hash.
                </p>
              }
            </div>

            <button
              class="primary-button account-submit"
              type="submit"
              [disabled]="busy || accountForm.invalid"
            >
              @if (busy) {
                Please wait…
              } @else {
                {{ mode === 'login' ? 'Sign in' : 'Create account' }}
              }
            </button>
          </form>

          @if (message) {
            <p class="status-message" role="alert">{{ message }}</p>
          }
        </div>
      } @else {
        <div class="account-toolbar">
          <p>
            Signed in as <b>{{ email }}</b>
          </p>

          <button type="button" class="secondary-button" (click)="logout()">Sign out</button>
        </div>

        @if (message) {
          <p class="status-message" role="status">{{ message }}</p>
        }

        @if (loading) {
          <p>Loading saved calculations…</p>
        } @else if (saved.length === 0) {
          <div class="explain-card">
            <h2>No saved calculations yet</h2>
            <p>
              Open a GST, EMI or percentage calculator and choose "Save calculation" when you want
              to keep a result.
            </p>
          </div>
        } @else {
          <div class="saved-list">
            @for (item of saved; track item.id) {
              <article class="saved-item">
                <div class="saved-content">
                  <div class="saved-card-header">
                    <div>
                      <span class="saved-tool-tag">
                        {{ toolName(item.toolSlug) }}
                      </span>

                      <h2>{{ item.title }}</h2>

                      <p class="saved-date">Saved {{ item.createdAt | date: 'medium' }}</p>
                    </div>

                    <div class="saved-actions">
                      <button type="button" class="secondary-button" (click)="rename(item)">
                        Rename
                      </button>

                      <button
                        type="button"
                        class="secondary-button danger-button"
                        (click)="remove(item)"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div class="saved-section">
                    <h3>Calculation inputs</h3>

                    <div class="saved-data-grid">
                      @for (
                        field of displayFields(item.inputs, item.toolSlug, 'input');
                        track field.key
                      ) {
                        <div class="saved-data-cell">
                          <span>{{ field.label }}</span>
                          <strong>{{ field.value }}</strong>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="saved-section saved-results-section">
                    <h3>Calculation results</h3>

                    <div class="saved-data-grid">
                      @for (
                        field of displayFields(item.result, item.toolSlug, 'result');
                        track field.key
                      ) {
                        <div
                          class="saved-data-cell"
                          [class.saved-primary-result]="isPrimaryResult(item.toolSlug, field.key)"
                        >
                          <span>{{ field.label }}</span>
                          <strong>{{ field.value }}</strong>
                        </div>
                      }
                    </div>
                  </div>

                  <details class="saved-raw-data">
                    <summary>View raw calculation data</summary>
                    <div class="raw-data-grid">
                      <div>
                        <h4>Inputs</h4>
                        <pre>{{ item.inputs | json }}</pre>
                      </div>
                      <div>
                        <h4>Results</h4>
                        <pre>{{ item.result | json }}</pre>
                      </div>
                    </div>
                  </details>
                </div>
              </article>
            }
          </div>
          @if (renameItem) {
            <div class="modal-backdrop" (click)="closeRename()" (keydown.escape)="closeRename()">
              <section
                class="rename-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="rename-modal-title"
                (click)="$event.stopPropagation()"
              >
                <div class="rename-modal-header">
                  <div>
                    <span class="saved-tool-tag">SAVED CALCULATION</span>
                    <h2 id="rename-modal-title">Rename calculation</h2>
                    <p>Give your calculation a meaningful name.</p>
                  </div>

                  <button
                    type="button"
                    class="modal-close"
                    aria-label="Close"
                    (click)="closeRename()"
                  >
                    &times;
                  </button>
                </div>

                <form (ngSubmit)="confirmRename()">
                  <label for="rename-title">Calculation name</label>

                  <input
                    id="rename-title"
                    class="account-input"
                    name="renameTitle"
                    [(ngModel)]="renameTitle"
                    required
                    minlength="2"
                    maxlength="80"
                    autofocus
                    placeholder="Enter calculation name"
                  />

                  <div class="rename-modal-actions">
                    <button
                      type="button"
                      class="secondary-button"
                      (click)="closeRename()"
                      [disabled]="renameBusy"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      class="primary-button"
                      [disabled]="renameBusy || renameTitle.trim().length < 2"
                    >
                      {{ renameBusy ? 'Saving...' : 'Save changes' }}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          }
        }
      }
    </section>
  `,
})
export class AccountComponent {
  readonly account = inject(AccountService);

  mode: 'login' | 'register' = 'login';

  email = '';
  password = '';

  busy = false;
  loading = false;
  submitted = false;
  showPassword = false;

  message = '';

  saved: SavedCalculation[] = [];
  renameItem: SavedCalculation | null = null;
  renameTitle = '';
  renameBusy = false;

  constructor() {
    this.account.email$.subscribe((value) => {
      if (value) {
        this.email = value;
        this.load();
      } else {
        this.saved = [];
      }
    });
  }

  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.message = '';
    this.submitted = false;
    this.showPassword = false;
    this.password = '';
  }

  submit(form: NgForm): void {
    this.submitted = true;
    this.message = '';

    if (form.invalid || this.busy) {
      form.control.markAllAsTouched();
      return;
    }

    this.busy = true;

    const normalizedEmail = this.email.trim();

    const action =
      this.mode === 'login'
        ? this.account.login(normalizedEmail, this.password)
        : this.account.register(normalizedEmail, this.password);

    action.subscribe({
      next: () => {
        this.password = '';
        this.message = 'Signed in successfully.';
        this.busy = false;
        this.submitted = false;
      },
      error: (error) => {
        this.message =
          error?.error?.detail ||
          error?.error?.message ||
          'Unable to complete account request. Please check your details and try again.';

        this.busy = false;
      },
    });
  }

  load(): void {
    this.loading = true;

    this.account.list().subscribe({
      next: (response) => {
        this.saved = response;
        this.loading = false;
      },
      error: () => {
        this.message = 'Could not load saved calculations. Please sign in again.';
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.account.logout();
    this.password = '';
    this.message = 'You have signed out.';
  }

  rename(item: SavedCalculation): void {
    this.renameItem = item;
    this.renameTitle = item.title;
    this.renameBusy = false;
  }

  closeRename(): void {
    if (this.renameBusy) {
      return;
    }

    this.renameItem = null;
    this.renameTitle = '';
  }

  confirmRename(): void {
    const item = this.renameItem;
    const title = this.renameTitle.trim();

    if (!item || title.length < 2 || title.length > 80 || this.renameBusy) {
      return;
    }

    this.renameBusy = true;

    this.account.rename(item.id, title).subscribe({
      next: () => {
        this.saved = this.saved.map((saved) =>
          saved.id === item.id ? { ...saved, title } : saved,
        );

        this.renameBusy = false;
        this.renameItem = null;
        this.renameTitle = '';
        this.message = 'Calculation renamed successfully.';
      },
      error: (error) => {
        this.renameBusy = false;
        this.message =
          error?.error?.detail || error?.error?.message || 'Could not rename this calculation.';
      },
    });
  }

  remove(item: SavedCalculation): void {
    if (!confirm(`Delete "${item.title}"?`)) {
      return;
    }

    this.account.remove(item.id).subscribe({
      next: () => {
        this.saved = this.saved.filter((x) => x.id !== item.id);
      },
      error: () => {
        this.message = 'Could not delete this item.';
      },
    });
  }

  toolName(slug: string): string {
    const names: Record<string, string> = {
      emi: 'EMI CALCULATOR',
      gst: 'GST CALCULATOR',
      percentage: 'PERCENTAGE CALCULATOR',
    };

    return names[slug] || slug.toUpperCase();
  }

  displayFields(
    data: Record<string, unknown>,
    toolSlug: string,
    section: 'input' | 'result',
  ): Array<{ key: string; label: string; value: string }> {
    const labels: Record<string, string> = {
      principal: 'Loan amount',
      annualRate: 'Annual interest rate',
      months: 'Loan tenure',
      monthlyEmi: 'Monthly EMI',
      totalPayment: 'Total payment',
      totalInterest: 'Total interest',

      amount: 'Amount',
      rate: 'GST rate',
      mode: 'Price type',
      supply: 'Supply type',
      taxableValue: 'Taxable value',
      gstAmount: 'GST amount',
      totalAmount: 'Total amount',
      cgst: 'CGST',
      sgst: 'SGST',
      igst: 'IGST',

      percent: 'Percentage',
      value: 'Value',
      part: 'Part',
      whole: 'Whole',
      from: 'Starting value',
      to: 'Ending value',
      percentageOf: 'Percentage result',
      whatPercentIs: 'Percentage comparison',
      percentageChange: 'Percentage change',
    };

    const currencyKeys = new Set([
      'principal',
      'amount',
      'value',
      'part',
      'whole',
      'from',
      'to',
      'monthlyEmi',
      'totalPayment',
      'totalInterest',
      'taxableValue',
      'gstAmount',
      'totalAmount',
      'cgst',
      'sgst',
      'igst',
    ]);

    return Object.entries(data || {}).map(([key, rawValue]) => {
      let value = String(rawValue ?? '—');

      if (typeof rawValue === 'number') {
        if (currencyKeys.has(key)) {
          value = formatINR(rawValue);
        } else if (key === 'annualRate' || key === 'rate' || key === 'percent') {
          value = `${formatIndianNumber(rawValue)}%`;
        } else if (key === 'months') {
          value = `${formatIndianNumber(rawValue)} months`;
        } else if (toolSlug === 'percentage' && section === 'result') {
          value = `${formatIndianNumber(rawValue)}%`;
        } else {
          value = formatIndianNumber(rawValue);
        }
      }

      if (key === 'mode') {
        value = rawValue === 'inclusive' ? 'Removing GST' : 'Adding GST';
      }

      if (key === 'supply') {
        value = rawValue === 'intra-state' ? 'Within state' : 'Between states';
      }

      return {
        key,
        label: labels[key] || this.humanize(key),
        value,
      };
    });
  }

  isPrimaryResult(toolSlug: string, key: string): boolean {
    return (
      (toolSlug === 'emi' && key === 'monthlyEmi') ||
      (toolSlug === 'gst' && key === 'totalAmount') ||
      (toolSlug === 'percentage' && key === 'percentageOf')
    );
  }

  private humanize(value: string): string {
    return value.replace(/([A-Z])/g, ' $1').replace(/^./, (character) => character.toUpperCase());
  }
}
