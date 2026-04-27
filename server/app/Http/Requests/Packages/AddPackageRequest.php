<?php

namespace App\Http\Requests\Packages;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AddPackageRequest extends FormRequest
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
            'from_city_id' => 'required|exists:cities,id|different:to_city_id',
            'to_city_id' => 'required|exists:cities,id',
            'package_name' => 'required|string|min:3|max:255',
            'package_size' => 'required|integer',
            'description' => 'nullable|string|max:1000',
            'date_delivery' => 'required',
            'urgency' => 'required|in:standard,urgent,très urgent',
            'accept_condition' => 'accepted',
            'price' => 'required',
            'pictures' => 'required|array|min:1|max:3',
            'pictures.*' => 'image|mimes:jpg,jpeg,png|max:2048'
        ];
    }
}
