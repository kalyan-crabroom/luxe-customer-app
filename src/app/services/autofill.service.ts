import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
    providedIn: 'root'
})
export class AutofillService {

    constructor() { }

    /**
     * Checks if the platform supports native password autofill
     * @returns boolean indicating if autofill is supported
     */
    isAutofillSupported(): boolean {
        return Capacitor.isNativePlatform();
    }

    /**
     * Triggers native password save prompt after successful login
     * This works by ensuring the form has proper autocomplete attributes
     * and the browser/webview recognizes it as a login form
     * @param email - User's email
     * @param password - User's password
     */
    async triggerPasswordSave(email: string, password: string): Promise<void> {
        if (!this.isAutofillSupported()) {
            console.log('Autofill not supported on this platform');
            return;
        }

        try {
            // On native platforms, the WebView will automatically detect the form submission
            // and prompt the user to save credentials if the form has proper autocomplete attributes
            console.log('Password save should be triggered by the native WebView');

            // For iOS, this will trigger the system keychain save prompt
            // For Android, this will trigger the autofill framework save prompt

        } catch (error) {
            console.error('Error triggering password save:', error);
        }
    }

    /**
     * Prepares form elements for autofill detection
     * This method ensures that form inputs have the correct attributes
     * for native password managers to recognize them
     */
    prepareFormForAutofill(emailElement: HTMLInputElement, passwordElement: HTMLInputElement): void {
        if (!emailElement || !passwordElement) {
            console.error('Form elements not found for autofill preparation');
            return;
        }

        // Set proper autocomplete attributes for native password managers
        emailElement.setAttribute('autocomplete', 'username');
        emailElement.setAttribute('name', 'username');
        emailElement.setAttribute('id', 'username');

        passwordElement.setAttribute('autocomplete', 'current-password');
        passwordElement.setAttribute('name', 'password');
        passwordElement.setAttribute('id', 'password');

        // Add input event listeners to detect autofill
        this.addAutofillDetection(emailElement, passwordElement);
    }

    /**
     * Adds event listeners to detect when autofill occurs
     * @param emailElement - Email input element
     * @param passwordElement - Password input element
     */
    private addAutofillDetection(emailElement: HTMLInputElement, passwordElement: HTMLInputElement): void {
        const detectAutofill = (element: HTMLInputElement, fieldName: string) => {
            // Detect autofill using various methods
            const checkAutofill = () => {
                // Method 1: Check if value was set without user interaction
                if (element.value && !element.dataset['userInteracted']) {
                    console.log(`${fieldName} was autofilled`);
                    element.dataset['autofilled'] = 'true';
                    this.onAutofillDetected(fieldName);
                }
            };

            // Method 2: Listen for input events
            element.addEventListener('input', (event: Event) => {
                const inputEvent = event as InputEvent;
                if (inputEvent.inputType === '' || inputEvent.inputType === null) {
                    // Likely autofill
                    console.log(`${fieldName} autofilled via input event`);
                    element.dataset['autofilled'] = 'true';
                    this.onAutofillDetected(fieldName);
                } else {
                    element.dataset['userInteracted'] = 'true';
                }
            });

            // Method 3: Listen for animationstart (webkit autofill detection)
            element.addEventListener('animationstart', (event) => {
                if (event.animationName === 'onAutoFillStart') {
                    console.log(`${fieldName} autofilled via animation detection`);
                    element.dataset['autofilled'] = 'true';
                    this.onAutofillDetected(fieldName);
                }
            });

            // Check periodically for autofill
            setTimeout(checkAutofill, 100);
            setTimeout(checkAutofill, 500);
            setTimeout(checkAutofill, 1000);
        };

        detectAutofill(emailElement, 'email');
        detectAutofill(passwordElement, 'password');
    }

    /**
     * Called when autofill is detected
     * @param fieldName - Name of the field that was autofilled
     */
    private onAutofillDetected(fieldName: string): void {
        console.log(`Autofill detected for ${fieldName}`);
        // You can emit events or update UI here if needed
    }

    /**
     * Clears autofill data and user interaction flags
     * @param emailElement - Email input element
     * @param passwordElement - Password input element
     */
    clearAutofillData(emailElement: HTMLInputElement, passwordElement: HTMLInputElement): void {
        if (emailElement) {
            delete emailElement.dataset['autofilled'];
            delete emailElement.dataset['userInteracted'];
        }
        if (passwordElement) {
            delete passwordElement.dataset['autofilled'];
            delete passwordElement.dataset['userInteracted'];
        }
    }

    /**
     * Checks if the current form was filled via autofill
     * @param emailElement - Email input element
     * @param passwordElement - Password input element
     * @returns boolean indicating if form was autofilled
     */
    isFormAutofilled(emailElement: HTMLInputElement, passwordElement: HTMLInputElement): boolean {
        const emailAutofilled = emailElement?.dataset['autofilled'] === 'true';
        const passwordAutofilled = passwordElement?.dataset['autofilled'] === 'true';
        return emailAutofilled || passwordAutofilled;
    }
}
