<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
            'phone' => 'required|unique:users,phone',
            'name' => 'required|string|min:3|max:50',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'accept' => 'required|accepted'
        ];
    }

    public function messages()
    {
        return [
            'phone.unique' => 'ce numéro de telephone existe déja',
            'email.unique' => 'Cette adresse e-mail existe déjà.',
            'password.confirmed' => 'le mot de passe de confirmation doit correspondre au mot de passe',
            'accept.required' => 'vous devez accepter nos conditions pour continuer'
        ];
    }

    
}
