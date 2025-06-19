/**
 * ApiError class for handling API errors
 * 
 * @example
 * const error = new ApiError('API error', 500);
 * console.log(error.message); // 'API error'
 * console.log(error.status); // 500
 */
class ApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * LoginError class for handling login errors
 * 
 * @example
 * const error = new LoginError('Login error');
 * console.log(error.message); // 'Login error'
 */
class LoginError extends Error {
    /**
     * Constructor for the LoginError class
     * 
     * @param message - The error message
     */
    constructor(message: string) {
        super(message);
        this.name = 'LoginError';
    }
}

/**
 * Form validation errors interface
 */
interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

/**
 * Form data interface for registration
 */
interface RegisterFormData {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

/**
 * RegisterError class for handling register errors
 * 
 * @example
 * const error = new RegisterError('Register error', { email: 'Invalid email' });
 * console.log(error.message); // 'Register error'
 * console.log(error.formErrors.email); // 'Invalid email'
 */
class RegisterError extends Error {
    public formErrors: FormErrors;

    /**
     * Constructor for the RegisterError class
     * 
     * @param message - The error message
     * @param formErrors - Object containing field-specific error messages
     */
    constructor(message: string, formErrors: FormErrors = {}) {
        super(message);
        this.name = 'RegisterError';
        this.formErrors = formErrors;
    }

    /**
     * Static method to validate registration form data
     * 
     * @description This function validates the form data and returns a RegisterError
     * if validation fails, or null if validation passes.
     * 
     * @param formData - The form data to validate
     * @returns RegisterError if validation fails, null if validation passes
     */
    static validateForm(formData: RegisterFormData): RegisterError | null {
        const errors: FormErrors = {};

        if (formData.username && formData.username.length < 3) {
            errors.username = "Benutzername muss mindestens 3 Zeichen lang sein";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
            errors.email = "Ungültige E-Mail-Adresse";
        }

        if (formData.password && formData.password.length < 8) {
            errors.password = "Passwort muss mindestens 8 Zeichen lang sein";
        }

        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwörter stimmen nicht überein";
        }

        if (Object.keys(errors).length > 0) {
            return new RegisterError("Bitte korrigiere die Fehler im Formular", errors);
        }

        return null;
    }
}

export { ApiError, LoginError, RegisterError, type FormErrors, type RegisterFormData };