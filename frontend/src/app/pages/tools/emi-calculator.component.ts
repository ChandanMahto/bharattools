import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { calculateEmi } from '../../tools/emi';
import { formatINR } from '../../core/format';
import { AccountService } from '../../core/account.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bt-emi-calculator',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="tool-page">
      <a class="back-link" href="/">← All tools</a>
      <div class="eyebrow">FINANCE · INDIA</div>
      <h1>EMI Calculator</h1>
      <p class="tool-intro">
        Estimate your monthly loan instalment using the reducing-balance method. Adjust the amount,
        rate and tenure to compare scenarios.
      </p>
      <div class="calculator-layout">
        <div class="calculator-panel">
          <label class="field-label"
            >Loan amount (₹)
            <input type="number" min="1" [(ngModel)]="principal" />
          </label>
          <label class="field-label"
            >Annual interest rate (%)
            <input type="number" min="0" step="0.01" [(ngModel)]="annualRate" />
          </label>
          <label class="field-label"
            >Loan tenure (months)
            <input type="number" min="1" step="1" [(ngModel)]="months" />
          </label>
          <div class="field-hint">
            Enter the annual nominal interest rate quoted by your lender. Actual lender schedules
            may vary due to fees, dates and rounding.
          </div>
        </div>
        <div class="result-panel">
          <span class="result-label">MONTHLY EMI</span>
          <strong class="result-total">{{ money(result.monthlyEmi) }}</strong>
          <div class="result-row">
            <span>Loan principal</span><b>{{ money(principal) }}</b>
          </div>
          <div class="result-row">
            <span>Total interest</span><b>{{ money(result.totalInterest) }}</b>
          </div>
          <div class="result-row">
            <span>Total payment</span><b>{{ money(result.totalPayment) }}</b>
          </div>
          <div class="result-note">
            Monthly reducing-balance estimate · Nothing is saved automatically
          </div>
          <button type="button" class="primary-button save-button" (click)="save()">
            Save calculation
          </button>
          @if (message) {
            <p class="status-message" role="status">
              {{ message }} <a routerLink="/account">Open account</a>
            </p>
          }
        </div>
      </div>
      <article class="explain-card">
        <h2>How EMI is calculated</h2>
        <p>EMI = P × r × (1 + r)<sup>n</sup> ÷ ((1 + r)<sup>n</sup> − 1)</p>
        <p>
          Here, P is the principal, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n
          is the number of monthly instalments. At 0% interest, EMI is simply principal divided by
          tenure.
        </p>
      </article>
    </section>
  `,
})
export class EmiCalculatorComponent {
  private account = inject(AccountService);
  message = '';
  principal = 2500000;
  annualRate = 8.5;
  months = 240;
  get result() {
    return calculateEmi(
      Math.max(1, Number(this.principal) || 1),
      Math.max(0, Number(this.annualRate) || 0),
      Math.max(1, Math.floor(Number(this.months) || 1)),
    );
  }
  money = formatINR;
  save() {
    if (!this.account.signedIn) {
      this.message = 'Sign in to save this calculation.';
      return;
    }
    this.account
      .save({
        toolSlug: 'emi',
        title: 'EMI calculation',
        inputs: {
          principal: this.principal,
          annualRate: this.annualRate,
          months: this.months,
        },
        result: this.result,
      })
      .subscribe({
        next: () => (this.message = 'Calculation saved to your account.'),
        error: () => (this.message = 'Could not save. Please try again.'),
      });
  }
}
